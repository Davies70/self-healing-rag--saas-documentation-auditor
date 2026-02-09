'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Send,
  Sparkles,
  FileText,
  Database,
  Copy,
  Check,
  Trash2,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import ReactMarkdown from 'react-markdown';

const API_BASE_URL = 'http://127.0.0.1:8000';

const SCENARIOS = [
  { id: 'stripe', name: 'Stripe API (Charges vs PaymentIntent)' },
  { id: 'react', name: 'React 18 (Event Delegation)' },
  { id: 'nextjs', name: 'Next.js 14 (Pages vs App Router)' },
  { id: 'aws_s3', name: 'AWS SDK v3 (Modular Imports)' },
  { id: 'python', name: 'Python 2 vs 3 (Print Statement)' },
  { id: 'openai', name: 'OpenAI Python SDK (v1.0 Migration)' },
  { id: 'tailwind', name: 'Tailwind CSS v3 (Dark Mode)' },
  { id: 'kubernetes', name: 'Kubernetes (Dockershim Removal)' },
  { id: 'github_actions', name: 'GitHub Actions (Set-Output)' },
  { id: 'flutter', name: 'Flutter (WillPopScope Deprecation)' },
];

export default function Home() {
  const [sessionId, setSessionId] = useState('');
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [activeScenario, setActiveScenario] = useState('');
  const { toast } = useToast();

  // 1. Initialize Session ID on Load
  useEffect(() => {
    let sid = localStorage.getItem('rag_session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('rag_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  // Helper for Headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'X-Session-ID': sessionId,
  });

  const loadScenario = async (scenarioId: string) => {
    setIsLoading(true);
    setActiveScenario(scenarioId);
    setAnswer('');
    setIssues([]);

    try {
      const res = await fetch(`${API_BASE_URL}/load-scenario`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ scenario_id: scenarioId }),
      });

      if (!res.ok) throw new Error('Failed to load scenario');

      toast({
        title: 'Scenario Loaded',
        description: 'Knowledge base updated with conflicting documentation.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load scenario.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    if (!query.trim()) return;
    setIsChatting(true);
    setAnswer('');

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      setAnswer(data.response);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Chat Failed' });
    } finally {
      setIsChatting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isChatting) {
      handleChat();
    }
  };

  const clearChat = () => {
    setQuery('');
    setAnswer('');
  };

  const runAudit = async () => {
    setIsLoading(true);
    setIssues([]);

    try {
      const res = await fetch(`${API_BASE_URL}/maintenance`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      setIssues(data.issues || []);

      if (data.issues?.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Conflicts Found',
          description: 'Review the audit report below.',
        });
      } else {
        toast({
          title: 'All Clear',
          description: 'No documentation conflicts detected.',
        });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Audit Failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100'>
      <Toaster />

      {/* Navbar */}
      <header className='bg-white border-b sticky top-0 z-20 shadow-sm'>
        <div className='max-w-5xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-2 text-indigo-600'>
            <div className='bg-indigo-50 p-2 rounded-lg'>
              <Database className='w-5 h-5' />
            </div>
            <h1 className='font-bold text-xl tracking-tight text-slate-900'>
              DocuGuard
              <span className='text-slate-400 font-medium text-sm ml-2 hidden sm:inline-block border-l pl-2 border-slate-200'>
                SaaS Auditor
              </span>
            </h1>
          </div>
          <div className='flex items-center gap-2'>
            <div className='hidden md:block text-xs text-slate-400 font-mono bg-slate-100 px-3 py-1 rounded-full'>
              Session: {sessionId.slice(0, 8)}
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-5xl mx-auto px-6 py-10 space-y-8'>
        {/* Main Grid Layout */}
        <div className='grid md:grid-cols-12 gap-8'>
          {/* LEFT COLUMN: Controls (4 cols) */}
          <div className='md:col-span-4 space-y-6'>
            <Card className='shadow-sm border-slate-200 h-fit sticky top-24'>
              <CardHeader className='bg-slate-50/50 pb-4 border-b border-slate-100'>
                <CardTitle className='text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2'>
                  <Wrench className='w-4 h-4' /> Simulation Control
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6 pt-6'>
                <div className='space-y-3'>
                  <label className='text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                    1. Load Environment
                  </label>
                  <Select onValueChange={loadScenario} disabled={isLoading}>
                    <SelectTrigger className='w-full bg-white border-slate-200 focus:ring-indigo-500'>
                      <SelectValue placeholder='Select Tech Stack...' />
                    </SelectTrigger>
                    <SelectContent>
                      {SCENARIOS.map((s) => (
                        <SelectItem
                          key={s.id}
                          value={s.id}
                          className='cursor-pointer'
                        >
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-3'>
                  <label className='text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                    2. Execute Audit
                  </label>
                  <Button
                    onClick={runAudit}
                    className='w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200'
                    disabled={!activeScenario || isLoading}
                  >
                    {isLoading ? (
                      <Spinner className='mr-2 text-white' />
                    ) : (
                      <Sparkles className='mr-2 w-4 h-4' />
                    )}
                    Run Auto-Auditor
                  </Button>
                </div>

                <div className='bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 leading-relaxed'>
                  <strong>Tip:</strong> Load a scenario to populate the
                  "Knowledge Base", then run the auditor to cross-reference the
                  Changelog against Documentation.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Results & Chat (8 cols) */}
          <div className='md:col-span-8 space-y-8'>
            {/* SECTION A: AUDIT RESULTS */}
            {issues.length > 0 && (
              <div className='animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4'>
                <div className='flex items-center gap-2 pb-2 border-b border-slate-200'>
                  <AlertTriangle className='w-5 h-5 text-red-500' />
                  <h2 className='font-bold text-lg text-slate-800'>
                    Audit Findings
                  </h2>
                </div>

                {issues.map((issueStr, i) => {
                  let data;
                  try {
                    const cleanJson = issueStr.substring(
                      issueStr.indexOf('{'),
                      issueStr.lastIndexOf('}') + 1,
                    );
                    data = JSON.parse(cleanJson);
                  } catch (e) {
                    return null;
                  }

                  if (!data.contradiction) return null;

                  return (
                    <Card
                      key={i}
                      className='border-l-4 border-l-red-500 shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-200'
                    >
                      <div className='bg-red-50/50 px-6 py-4 flex justify-between items-center border-b border-red-100'>
                        <div className='flex items-center gap-2 text-red-700 font-bold'>
                          <span>Conflict Detected</span>
                        </div>
                        <span className='bg-white text-red-600 text-[10px] font-extrabold px-3 py-1 rounded-full border border-red-200 shadow-sm uppercase tracking-widest'>
                          {data.severity || 'Critical'}
                        </span>
                      </div>

                      <div className='p-6 space-y-6'>
                        <div>
                          <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wide mb-2'>
                            Analysis
                          </h3>
                          <p className='text-slate-700 text-sm leading-relaxed font-medium'>
                            {data.reason}
                          </p>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                          <div className='bg-slate-50 p-4 rounded-lg border border-slate-100'>
                            <span className='flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-2'>
                              <FileText className='w-3 h-3' /> Old Documentation
                            </span>
                            <p className='text-slate-500 line-through decoration-red-400/50 text-xs font-mono leading-relaxed bg-white p-2 rounded border border-slate-100'>
                              "{data.old_quote || '...'}"
                            </p>
                          </div>
                          <div className='bg-slate-50 p-4 rounded-lg border border-slate-100'>
                            <span className='flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-2'>
                              <Terminal className='w-3 h-3' /> New Changelog
                            </span>
                            <p className='text-slate-800 text-xs font-mono leading-relaxed bg-white p-2 rounded border border-slate-100 font-medium border-l-2 border-l-green-500'>
                              "{data.new_quote || '...'}"
                            </p>
                          </div>
                        </div>

                        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                          <div className='flex items-center gap-2 text-green-800 font-bold text-sm mb-2'>
                            <CheckCircle2 className='w-4 h-4' /> Suggested
                            Remediation
                          </div>
                          <code className='block bg-white text-green-700 px-3 py-2 rounded border border-green-100 text-xs font-mono'>
                            {data.fix}
                          </code>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* SECTION B: CHAT INTERFACE */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between pb-2 border-b border-slate-200'>
                <div className='flex items-center gap-2'>
                  <MessageSquare className='w-5 h-5 text-indigo-600' />
                  <h2 className='font-bold text-lg text-slate-800'>
                    Verification Agent
                  </h2>
                </div>
                {answer && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={clearChat}
                    className='text-slate-400 hover:text-red-500 h-8 text-xs'
                  >
                    <Trash2 className='w-3 h-3 mr-1' /> Clear
                  </Button>
                )}
              </div>

              <Card className='shadow-sm border-slate-200 overflow-hidden'>
                <CardContent className='p-0'>
                  {/* Chat Output Area */}
                  <div className='bg-slate-50/50 min-h-[160px] max-h-[500px] overflow-y-auto p-6'>
                    {answer ? (
                      <div className='flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300'>
                        <div className='w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200'>
                          <Sparkles className='w-4 h-4 text-indigo-600' />
                        </div>

                        <div className='flex-1 min-w-0'>
                          <div className='prose prose-sm max-w-none text-slate-700 leading-7'>
                            <ReactMarkdown
                              components={{
                                // 1. Headers
                                h1: ({ node, ...props }) => (
                                  <h1
                                    className='text-lg font-bold text-slate-900 mt-4 mb-2'
                                    {...props}
                                  />
                                ),
                                h2: ({ node, ...props }) => (
                                  <h2
                                    className='text-base font-bold text-slate-800 mt-3 mb-2'
                                    {...props}
                                  />
                                ),

                                // 2. Bold Text
                                strong: ({ node, ...props }) => (
                                  <span
                                    className='font-bold text-indigo-700'
                                    {...props}
                                  />
                                ),

                                // 3. Lists
                                ul: ({ node, ...props }) => (
                                  <ul
                                    className='list-disc pl-5 space-y-1 my-3 text-slate-600'
                                    {...props}
                                  />
                                ),
                                ol: ({ node, ...props }) => (
                                  <ol
                                    className='list-decimal pl-5 space-y-1 my-3 text-slate-600'
                                    {...props}
                                  />
                                ),
                                li: ({ node, ...props }) => (
                                  <li className='pl-1' {...props} />
                                ),

                                // 4. Paragraphs
                                p: ({ node, ...props }) => (
                                  <p className='mb-3 last:mb-0' {...props} />
                                ),

                                // 5. Code Blocks (With Copy Button)
                                code: ({
                                  node,
                                  inline,
                                  className,
                                  children,
                                  ...props
                                }: any) => {
                                  // Inline Code
                                  if (inline) {
                                    return (
                                      <code
                                        className='bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs font-semibold'
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    );
                                  }
                                  // Block Code
                                  return (
                                    <CodeBlock className={className}>
                                      {children}
                                    </CodeBlock>
                                  );
                                },
                              }}
                            >
                              {answer}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Empty State
                      <div className='flex flex-col items-center justify-center h-full py-10 text-slate-400'>
                        <div className='bg-slate-100 p-3 rounded-full mb-3'>
                          <MessageSquare className='w-6 h-6 opacity-40' />
                        </div>
                        <p className='text-sm font-medium'>
                          Ready to answer questions
                        </p>
                        <p className='text-xs opacity-60 mt-1'>
                          Load a scenario above to get started
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className='p-4 bg-white border-t border-slate-100'>
                    <div className='flex gap-2'>
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question about the documentation (e.g. 'How do I authenticate?')"
                        className='border-slate-200 focus-visible:ring-indigo-500 shadow-sm'
                      />
                      <Button
                        onClick={handleChat}
                        disabled={isChatting || !query.trim()}
                        className='bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                      >
                        {isChatting ? (
                          <Spinner />
                        ) : (
                          <Send className='w-4 h-4' />
                        )}
                      </Button>
                    </div>
                    <p className='text-[10px] text-slate-400 mt-2 text-center'>
                      AI can make mistakes. Verify important info.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENT: CODE BLOCK WITH COPY BUTTON ---
const CodeBlock = ({ children, className }: any) => {
  const [isCopied, setIsCopied] = useState(false);
  const textInput = String(children).replace(/\n$/, '');

  const onCopy = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(textInput);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className='relative my-4 group rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-lg'>
      {/* Terminal Header */}
      <div className='flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800'>
        <div className='flex gap-1.5'>
          <div className='w-2.5 h-2.5 rounded-full bg-red-500/80' />
          <div className='w-2.5 h-2.5 rounded-full bg-yellow-500/80' />
          <div className='w-2.5 h-2.5 rounded-full bg-green-500/80' />
        </div>
        <div className='text-[10px] text-slate-500 font-mono'>bash</div>
      </div>

      {/* Copy Button */}
      <div className='absolute top-2 right-2 z-10'>
        <button
          onClick={onCopy}
          className='flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition-colors backdrop-blur-sm'
        >
          {isCopied ? (
            <>
              <Check className='w-3 h-3 text-green-400' />
              <span className='text-green-400'>Copied</span>
            </>
          ) : (
            <>
              <Copy className='w-3 h-3' />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className='p-4 overflow-x-auto text-slate-300 font-mono text-xs leading-relaxed selection:bg-indigo-500/30'>
        <code className={className}>{textInput}</code>
      </pre>
    </div>
  );
};
