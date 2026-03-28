'use client';

import { useState, useEffect, useCallback } from 'react';

interface Document {
  id: number;
  name: string;
  type: string;
  created_at: string;
  chunk_count: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState<'upload' | 'manage'>('upload');

  // Upload form
  const [uploadType, setUploadType] = useState<'pdf' | 'email'>('pdf');
  const [docName, setDocName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [emailContent, setEmailContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // DB init
  const [initStatus, setInitStatus] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pw');
    if (saved) {
      setPassword(saved);
      setAuthed(true);
    }
  }, []);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    sessionStorage.setItem('admin_pw', password);
    setAuthed(true);
    setAuthError('');
  }

  function logout() {
    sessionStorage.removeItem('admin_pw');
    setAuthed(false);
    setPassword('');
  }

  const authHeaders = useCallback(() => ({ 'x-admin-password': password }), [password]);

  const loadDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch('/api/documents', { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setDocuments(data.documents);
      else if (res.status === 401) { setAuthed(false); setAuthError('Incorrect password.'); }
    } finally {
      setLoadingDocs(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (authed && tab === 'manage') loadDocuments();
  }, [authed, tab, loadDocuments]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!docName.trim()) { setUploadStatus('Please enter a document name.'); return; }

    setUploading(true);
    setUploadStatus('Processing… this may take a moment for large files.');

    const formData = new FormData();
    formData.append('type', uploadType);
    formData.append('name', docName);
    if (uploadType === 'pdf' && file) formData.append('file', file);
    else formData.append('content', emailContent);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus(`Done! Processed ${data.chunks} chunks.`);
        setDocName('');
        setFile(null);
        setEmailContent('');
      } else if (res.status === 401) {
        setAuthed(false);
        setAuthError('Incorrect password.');
      } else {
        setUploadStatus(`Error: ${data.error}`);
      }
    } catch {
      setUploadStatus('Upload failed — check your connection.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/documents?id=${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) loadDocuments();
  }

  async function handleInitDb() {
    setInitStatus('Initialising…');
    const res = await fetch('/api/init-db', { headers: authHeaders() });
    const data = await res.json();
    setInitStatus(res.ok ? `Done: ${data.message}` : `Error: ${data.error}`);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-school-teal-light flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-school-teal flex items-center justify-center">
              <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
                <rect x="17" y="2" width="6" height="36" rx="2" fill="white" />
                <rect x="2" y="14" width="36" height="6" rx="2" fill="white" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Admin Panel</h1>
              <p className="text-xs text-gray-500">School Admin</p>
            </div>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-teal/50"
              autoFocus
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-school-teal text-white rounded-lg py-2 text-sm font-medium hover:bg-school-teal-dark transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-school-teal text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-school-teal-dark flex items-center justify-center">
            <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
              <rect x="17" y="2" width="6" height="36" rx="2" fill="white" />
              <rect x="2" y="14" width="36" height="6" rx="2" fill="white" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold">School Admin — Admin</h1>
            <p className="text-xs text-teal-100">Document Management</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <a href="/" className="text-sm text-teal-100 hover:text-white underline">
            View chatbot
          </a>
          <button
            onClick={logout}
            className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* DB Init */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">First time setup</p>
            <p className="text-xs text-gray-500">Run once to create the database tables.</p>
          </div>
          <div className="flex items-center gap-3">
            {initStatus && <span className="text-xs text-gray-500">{initStatus}</span>}
            <button
              onClick={handleInitDb}
              className="bg-school-blue text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Initialise DB
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['upload', 'manage'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                tab === t ? 'bg-white text-school-teal shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'upload' ? 'Upload Document' : 'Manage Documents'}
            </button>
          ))}
        </div>

        {/* Upload Tab */}
        {tab === 'upload' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <form onSubmit={handleUpload} className="space-y-4">
              {/* Type selector */}
              <div className="flex gap-2">
                {(['pdf', 'email'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setUploadType(t)}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                      uploadType === t
                        ? 'border-school-teal bg-school-teal-light text-school-teal-dark font-medium'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {t === 'pdf' ? 'PDF Document' : 'Email / Newsletter'}
                  </button>
                ))}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document name
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  placeholder={uploadType === 'pdf' ? 'e.g. Anti-Bullying Policy 2024' : 'e.g. Spring Term Newsletter Week 3'}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-teal/50"
                />
              </div>

              {/* Content */}
              {uploadType === 'pdf' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PDF file</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-school-teal-light file:text-school-teal-dark hover:file:bg-school-teal/20"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paste email content
                  </label>
                  <textarea
                    value={emailContent}
                    onChange={e => setEmailContent(e.target.value)}
                    rows={8}
                    placeholder="Paste the email text here…"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-school-teal/50 resize-y"
                  />
                </div>
              )}

              {uploadStatus && (
                <p className={`text-sm ${uploadStatus.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                  {uploadStatus}
                </p>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-school-teal text-white rounded-lg py-2.5 text-sm font-medium hover:bg-school-teal-dark transition-colors disabled:opacity-50"
              >
                {uploading ? 'Processing…' : 'Upload & Process'}
              </button>
            </form>
          </div>
        )}

        {/* Manage Tab */}
        {tab === 'manage' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-medium text-gray-800">
                {loadingDocs ? 'Loading…' : `${documents.length} document${documents.length !== 1 ? 's' : ''}`}
              </h2>
              <button
                onClick={loadDocuments}
                className="text-sm text-school-teal hover:underline"
              >
                Refresh
              </button>
            </div>

            {documents.length === 0 && !loadingDocs && (
              <p className="px-6 py-8 text-center text-sm text-gray-400">
                No documents uploaded yet.
              </p>
            )}

            <ul className="divide-y">
              {documents.map(doc => (
                <li key={doc.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400">
                      {doc.type.toUpperCase()} · {doc.chunk_count} chunks ·{' '}
                      {new Date(doc.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id, doc.name)}
                    className="text-red-400 hover:text-red-600 text-sm flex-shrink-0 transition-colors"
                    aria-label={`Delete ${doc.name}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
