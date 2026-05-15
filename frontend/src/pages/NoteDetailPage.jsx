import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const NoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/notes/${id}`)
      .then((res) => setNote(res.data.note))
      .catch(() => navigate('/notes'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await api.delete(`/notes/${id}`);
    navigate('/notes');
  };

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;
  if (!note) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/notes" className="text-sm text-gray-500 hover:text-indigo-600 mb-4 inline-block">
        ← 목록으로
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
            {note.subject_name}
          </span>
          {!note.is_public && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">비공개</span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">{note.title}</h1>
        <p className="text-sm text-gray-400 mb-6">{note.username} · {note.created_at?.slice(0, 10)}</p>

        <div className="prose prose-sm max-w-none border-t pt-6">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>

        {user?.id === note.user_id && (
          <div className="flex gap-2 pt-6 mt-6 border-t border-gray-100">
            <Link to={`/notes/${id}/edit`}
              className="flex-1 text-center text-sm border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition">
              수정
            </Link>
            <button onClick={handleDelete}
              className="flex-1 text-sm bg-red-50 border border-red-200 text-red-600 py-2 rounded-lg hover:bg-red-100 transition">
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteDetailPage;
