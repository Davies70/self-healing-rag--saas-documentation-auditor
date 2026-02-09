# backend/scenarios.py

SCENARIOS = {
    "stripe": {
        "doc_a": """
        STRIPE API REFERENCE v2020-08-27
        
        1. CHARGES API
        To charge a card, use the Charge object.
        POST /v1/charges
        Params:
        - amount: Integer
        - source: Card ID (e.g., tok_visa)
        
        2. API KEYS
        Your API keys are located in the dashboard. 
        Publishable keys start with 'pk_live_'.
        Secret keys start with 'sk_live_'.
        You can embed your Secret Key in your mobile app code for easy access.
        """,
        
        "doc_b": """
        STRIPE API CHANGELOG v2024-01-01
        
        CRITICAL SECURITY & API UPDATES:
        
        1. Charges API Deprecated
        The /v1/charges endpoint is removed. You must migrate to /v1/payment_intents.
        The 'source' parameter is no longer supported; use 'payment_method' instead.
        
        2. API Key Security (Breaking Change)
        Embedding Secret Keys (sk_live_) in client-side code (mobile apps/frontend) is now strictly prohibited and will cause immediate account suspension.
        You must proxy requests through a backend server.
        """
    },
    "react": {
        "doc_a": """
        REACT DOM v17
        
        1. Rendering
        To render an app, use the render method:
        import ReactDOM from 'react-dom';
        ReactDOM.render(<App />, document.getElementById('root'));
        
        2. Event Delegation
        React attaches event listeners to the `document` node.
        Stopping propagation (e.stopPropagation) prevents the event from reaching the document.
        """,
        
        "doc_b": """
        REACT DOM v18 CHANGELOG
        
        1. New Root API
        ReactDOM.render is deprecated. Using it will warn in the console and run in compatibility mode.
        You must use `ReactDOM.createRoot`:
        import { createRoot } from 'react-dom/client';
        const root = createRoot(container);
        root.render(<App />);
        
        2. Event Delegation Update
        React no longer attaches events to `document`. 
        Events are now attached to the root DOM container (div#root).
        """
    },
    "nextjs": {
        "doc_a": """
        NEXT.JS v12 (PAGES ROUTER)
        
        1. Data Fetching
        Use `getStaticProps` or `getServerSideProps` inside your 'pages/' files to fetch data.
        
        2. Link Component
        The <Link> component requires a child <a> tag:
        <Link href="/about">
          <a>About Us</a>
        </Link>
        """,
        
        "doc_b": """
        NEXT.JS v14 (APP ROUTER)
        
        1. Data Fetching
        `getStaticProps` and `getServerSideProps` are removed in the 'app' directory.
        Use standard `await fetch()` in your Server Components.
        
        2. Link Component Update
        The <Link> component no longer requires a child <a> tag. 
        Passing an <a> tag as a child is now invalid and causes hydration errors.
        Usage: <Link href="/about">About Us</Link>
        """
    },
    "aws_s3": {
        "doc_a": """
        AWS SDK JS v2
        
        1. Instantiation
        var s3 = new AWS.S3({ region: 'us-west-1' });
        
        2. Uploads
        s3.upload({Bucket: 'b', Key: 'k', Body: f}, function(err, data) { ... });
        
        3. Global Config
        AWS.config.update({ accessKeyId: '...', secretAccessKey: '...' });
        """,
        
        "doc_b": """
        AWS SDK JS v3
        
        1. Modular Imports (Breaking)
        Global 'AWS' namespace is removed. You must import { S3Client } from "@aws-sdk/client-s3".
        
        2. Uploads
        The `.upload()` method is removed from the client. 
        You must use the `@aws-sdk/lib-storage` package or `PutObjectCommand`.
        
        3. Configuration
        Global configuration `AWS.config.update` is removed.
        Configuration must be passed explicitly to the Client constructor.
        """
    },
    "python": {
        "doc_a": """
        PYTHON 2.7
        
        1. Print
        print "Hello World"
        
        2. Integer Division
        In Python 2, dividing two integers performs floor division:
        5 / 2 # Returns 2
        """,
        
        "doc_b": """
        PYTHON 3.x
        
        1. Print Function
        `print` is now a function. `print "Hello"` raises a SyntaxError.
        Use `print("Hello")`.
        
        2. True Division
        The `/` operator now performs float division:
        5 / 2 # Returns 2.5
        Use `//` for floor division.
        """
    },
    "openai": {
        "doc_a": """
        OPENAI PYTHON v0.28
        
        1. Setup
        import openai
        openai.api_key = "sk-..."
        
        2. Fine-tuning
        response = openai.FineTune.create(training_file="file-id")
        """,
        
        "doc_b": """
        OPENAI PYTHON v1.0
        
        1. Client Instantiation
        Global setup is removed.
        client = OpenAI(api_key="sk-...")
        
        2. Fine-tuning API Renamed
        `openai.FineTune` is removed. 
        Use `client.fine_tuning.jobs.create(...)` instead.
        """
    },
    "tailwind": {
        "doc_a": """
        TAILWIND v2
        
        1. Dark Mode
        darkMode: 'class'
        
        2. Purge
        Configure the `purge` option to remove unused styles:
        purge: ['./src/**/*.js']
        """,
        
        "doc_b": """
        TAILWIND v3
        
        1. Dark Mode
        'class' strategy is deprecated. Use 'selector'.
        
        2. Content (Breaking)
        The `purge` option has been renamed to `content`.
        Using `purge` will throw a warning and may be ignored in v4.
        """
    },
    "kubernetes": {
        "doc_a": """
        KUBERNETES v1.19
        
        1. Ingress
        apiVersion: networking.k8s.io/v1beta1
        kind: Ingress
        
        2. Docker
        Kubernetes uses Dockershim to communicate with Docker Engine.
        """,
        
        "doc_b": """
        KUBERNETES v1.25
        
        1. Ingress API Upgrade
        networking.k8s.io/v1beta1 is removed. You must use `networking.k8s.io/v1`.
        
        2. Dockershim Removed
        Dockershim is deleted. Docker Engine is no longer a supported runtime.
        Use containerd.
        """
    },
    "github_actions": {
        "doc_a": """
        GITHUB ACTIONS v1
        
        1. Set Output
        echo "::set-output name=my_var::value"
        
        2. Save State
        echo "::save-state name=my_state::value"
        """,
        
        "doc_b": """
        GITHUB ACTIONS v3
        
        DEPRECATION NOTICE:
        1. set-output is disabled.
        Write to $GITHUB_OUTPUT instead: echo "my_var=value" >> $GITHUB_OUTPUT
        
        2. save-state is disabled.
        Write to $GITHUB_STATE instead: echo "my_state=value" >> $GITHUB_STATE
        """
    },
    "flutter": {
        "doc_a": """
        FLUTTER v2
        
        1. Back Button
        WillPopScope(onWillPop: ...)
        
        2. Theme Buttons
        FlatButton and RaisedButton are standard.
        """,
        
        "doc_b": """
        FLUTTER v3.12
        
        1. PopScope
        WillPopScope is deprecated. Use PopScope.
        
        2. Button Migration
        FlatButton and RaisedButton are removed classes.
        Use TextButton and ElevatedButton respectively.
        """
    }
}