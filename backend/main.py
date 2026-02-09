import os

import json # <--- IMPORTANT IMPORT
from typing import Dict, List
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document

from scenarios import SCENARIOS

app = FastAPI()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. SETUP BRAIN ---
print("Loading local embedding model...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

llm = ChatGroq(
    api_key=os.getenv("GROK_API_KEY"),
    model="llama-3.3-70b-versatile",
    temperature=0
)

# --- 2. SESSION MANAGEMENT ---
user_sessions: Dict[str, FAISS] = {}

def get_session_id(request: Request):
    return request.headers.get("X-Session-ID")

def get_vectorstore(session_id: str):
    if session_id in user_sessions:
        return user_sessions[session_id]
    
    folder_path = f"faiss_indexes/{session_id}"
    if os.path.exists(folder_path):
        try:
            vs = FAISS.load_local(folder_path, embeddings, allow_dangerous_deserialization=True)
            user_sessions[session_id] = vs
            return vs
        except:
            return None
    return None

class ChatRequest(BaseModel):
    message: str

class ScenarioRequest(BaseModel):
    scenario_id: str

# --- API ENDPOINTS ---

@app.post("/load-scenario")
async def load_scenario(req: ScenarioRequest, request: Request):
    session_id = get_session_id(request)
    if not session_id: return {"error": "No Session ID"}
    
    data = SCENARIOS.get(req.scenario_id)
    if not data: return {"error": "Scenario not found"}
    
    docs = [
        Document(page_content=data["doc_a"], metadata={"source": "Old_Documentation.txt"}),
        Document(page_content=data["doc_b"], metadata={"source": "New_Changelog.txt"})
    ]
    
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    splits = splitter.split_documents(docs)
    
    vectorstore = FAISS.from_documents(documents=splits, embedding=embeddings)
    
    folder = f"faiss_indexes/{session_id}"
    if not os.path.exists(folder): os.makedirs(folder)
    vectorstore.save_local(folder)
    
    user_sessions[session_id] = vectorstore
    
    return {"status": f"Loaded scenario: {req.scenario_id}", "chunks": len(splits)}

@app.post("/chat")
async def chat(req: ChatRequest, request: Request):
    session_id = get_session_id(request)
    vectorstore = get_vectorstore(session_id)
    
    if vectorstore is None:
        return {"response": "Please load a scenario first."}
        
    retriever = vectorstore.as_retriever()
    docs = retriever.invoke(req.message)
    context = "\n\n".join([d.page_content for d in docs])
    
    prompt = f"Context: {context}\n\nQuestion: {req.message}"
    response = llm.invoke(prompt)
    return {"response": response.content}

# --- THE UPGRADED MULTI-ISSUE AUDITOR ---
@app.get("/maintenance")
async def run_maintenance(request: Request):
    session_id = get_session_id(request)
    vectorstore = get_vectorstore(session_id)
    
    if vectorstore is None:
        return {"issues": []}

    docstore = vectorstore.docstore._dict
    doc_ids = list(docstore.keys())
    
    if len(doc_ids) < 2: return {"issues": []}

    doc_a = docstore[doc_ids[0]].page_content
    doc_b = docstore[doc_ids[1]].page_content 
    
    # 1. Ask for a LIST of issues
    prompt = f"""
    You are a Senior Technical Writer auditing software documentation.
    
    Compare "Text A" (Old Docs) against "Text B" (New Changelog).
    
    Task: Identify ALL deprecated features, breaking changes, or security warnings.
    There might be more than one issue. Find them all.
    
    Text A: {doc_a}
    Text B: {doc_b}
    
    Reply ONLY in a JSON LIST format. Do not add markdown formatting.
    Example:
    [
      {{
        "contradiction": true,
        "reason": "Description of issue 1",
        "fix": "Fix for issue 1",
        "severity": "High",
        "old_quote": "...",
        "new_quote": "..."
      }},
      {{
        "contradiction": true,
        "reason": "Description of issue 2...",
        ...
      }}
    ]
    """
    
    response = llm.invoke(prompt)
    
    # 2. Parse the List safely
    try:
        content = response.content.strip()
        # Clean up if Groq adds Markdown code blocks
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        
        # Parse into Python List
        parsed_issues = json.loads(content)
        
        # 3. Convert back to list of strings (Frontend expects strings)
        issue_strings = [json.dumps(issue) for issue in parsed_issues]
        
        return {"issues": issue_strings}
        
    except Exception as e:
        print(f"JSON Parse Error: {e}")
        # Fallback: Just send the raw text if parsing fails
        return {"issues": [response.content]}