import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  listApiKeys,
  createApiKeyAdmin,
  updateApiKeyAdmin,
  disableApiKeyAdmin,
} from '../utils/api';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AdminApiKeyItem {
  id: string;
  key: string;
  name: string;
  quota: number;
  usage: number;
  status: string;
  expiresAt: number | null;
  createdAt: number;
  updatedAt: number;
}

const maskKey = (key: string) => {
  if (key.length <= 8) return key;
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
};

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') || '');
  const [inputToken, setInputToken] = useState(() => sessionStorage.getItem('admin_token') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<AdminApiKeyItem[]>([]);

  const [form, setForm] = useState({ name: '', quota: 1000, expiresAt: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isAuthed = useMemo(() => !!token, [token]);

  useEffect(() => {
    if (!isOpen || !token) return;
    const fetchKeys = async () => {
      setLoading(true);
      const res = await listApiKeys(token);
      if (res.ok && res.apiKeys) {
        setKeys(res.apiKeys as AdminApiKeyItem[]);
        setError(null);
      } else {
        setError(res.error || 'load_failed');
      }
      setLoading(false);
    };
    fetchKeys();
  }, [isOpen, token]);

  const handleLogin = async () => {
    setToken(inputToken.trim());
    sessionStorage.setItem('admin_token', inputToken.trim());
  };

  const handleCreate = async () => {
    if (!form.name || form.quota <= 0) {
      setError('invalid_input');
      return;
    }
    setSaving(true);
    const res = await createApiKeyAdmin(token, {
      name: form.name,
      quota: form.quota,
      expiresAt: form.expiresAt ? Number(form.expiresAt) : null,
    });
    if (res.ok && res.apiKey) {
      setKeys(prev => [res.apiKey as AdminApiKeyItem, ...prev]);
      setForm({ name: '', quota: 1000, expiresAt: '' });
      setError(null);
    } else {
      setError(res.error || 'create_failed');
    }
    setSaving(false);
  };

  const handleUpdate = async (id: string, payload: Partial<AdminApiKeyItem>) => {
    setSaving(true);
    const res = await updateApiKeyAdmin(token, id, {
      name: payload.name,
      quota: payload.quota,
      expiresAt: payload.expiresAt,
      status: payload.status,
    });
    if (res.ok && res.apiKey) {
      setKeys(prev => prev.map(k => (k.id === id ? (res.apiKey as AdminApiKeyItem) : k)));
      setEditingId(null);
      setError(null);
    } else {
      setError(res.error || 'update_failed');
    }
    setSaving(false);
  };

  const handleDisable = async (id: string) => {
    setSaving(true);
    const res = await disableApiKeyAdmin(token, id);
    if (res.ok) {
      setKeys(prev => prev.map(k => (k.id === id ? { ...k, status: 'disabled' } : k)));
      setError(null);
    } else {
      setError(res.error || 'disable_failed');
    }
    setSaving(false);
  };

  const renderContent = () => {
    if (!isOpen) return null;
    if (!isAuthed) {
      return (
        <div className="space-y-3">
          <input
            type="password"
            value={inputToken}
            onChange={e => setInputToken(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Admin token"
          />
          <button onClick={handleLogin} className="w-full bg-primary text-primary-foreground px-3 py-2 rounded">
            {t('common.login')}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 border rounded flex-1"
            placeholder={t('common.name') || 'Name'}
          />
          <input
            type="number"
            value={form.quota}
            onChange={e => setForm({ ...form, quota: Number(e.target.value) })}
            className="px-3 py-2 border rounded w-32"
            placeholder="Quota"
          />
          <input
            type="number"
            value={form.expiresAt}
            onChange={e => setForm({ ...form, expiresAt: e.target.value })}
            className="px-3 py-2 border rounded w-44"
            placeholder="ExpiresAt (timestamp or empty)"
          />
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            {t('common.create')}
          </button>
        </div>

        {error && <div className="text-red-500 text-sm">{String(error)}</div>}

        {loading ? (
          <div>{t('common.loading')}</div>
        ) : (
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">{t('common.name')}</th>
                <th className="p-2 text-left">Key</th>
                <th className="p-2 text-left">Quota</th>
                <th className="p-2 text-left">Usage</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Expires</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id} className="border-t">
                  <td className="p-2">
                    {editingId === k.id ? (
                      <input
                        className="px-2 py-1 border rounded w-full"
                        value={k.name}
                        onChange={e => setKeys(prev => prev.map(item => item.id === k.id ? { ...item, name: e.target.value } : item))}
                      />
                    ) : (
                      k.name
                    )}
                  </td>
                  <td className="p-2 font-mono">{maskKey(k.key)}</td>
                  <td className="p-2">
                    {editingId === k.id ? (
                      <input
                        type="number"
                        className="px-2 py-1 border rounded w-24"
                        value={k.quota}
                        onChange={e => setKeys(prev => prev.map(item => item.id === k.id ? { ...item, quota: Number(e.target.value) } : item))}
                      />
                    ) : k.quota}
                  </td>
                  <td className="p-2">{k.usage}</td>
                  <td className="p-2">
                    {editingId === k.id ? (
                      <select
                        className="px-2 py-1 border rounded"
                        value={k.status}
                        onChange={e => setKeys(prev => prev.map(item => item.id === k.id ? { ...item, status: e.target.value } : item))}
                      >
                        <option value="active">active</option>
                        <option value="disabled">disabled</option>
                      </select>
                    ) : (
                      k.status
                    )}
                  </td>
                  <td className="p-2">
                    {editingId === k.id ? (
                      <input
                        type="number"
                        className="px-2 py-1 border rounded w-36"
                        value={k.expiresAt ?? ''}
                        onChange={e => setKeys(prev => prev.map(item => item.id === k.id ? { ...item, expiresAt: e.target.value ? Number(e.target.value) : null } : item))}
                      />
                    ) : (
                      k.expiresAt ?? '—'
                    )}
                  </td>
                  <td className="p-2 space-x-2">
                    {editingId === k.id ? (
                      <>
                        <button
                          className="px-3 py-1 bg-primary text-primary-foreground rounded"
                          disabled={saving}
                          onClick={() => handleUpdate(k.id, k)}
                        >
                          {t('common.save')}
                        </button>
                        <button className="px-3 py-1 border rounded" onClick={() => setEditingId(null)}>
                          {t('common.cancel')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="px-3 py-1 border rounded" onClick={() => setEditingId(k.id)}>
                          {t('common.edit')}
                        </button>
                        <button
                          className="px-3 py-1 border rounded text-red-500"
                          onClick={() => handleDisable(k.id)}
                          disabled={saving}
                        >
                          {t('common.disable') || 'Disable'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Admin</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
