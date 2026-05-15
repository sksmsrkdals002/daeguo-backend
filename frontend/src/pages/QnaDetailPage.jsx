import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const QnaDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({ content: '', is_anonymous: false });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/qna/${id}`);
      setPost(res.data.post);
      setComments(res.data.comments);
    } catch {
      navigate('/qna');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await api.delete(`/qna/${id}`);
    navigate('/qna');
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentForm.content.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/qna/${id}/comments`, commentForm);
      setComments((prev) => [...prev, res.data.comment]);
      setCommentForm({ content: '', is_anonymous: false });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    await api.delete(`/qna/${id}/comments/${commentId}`);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;
  if (!post) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/qna" className="text-sm text-gray-500 hover:text-indigo-600 mb-4 inline-block">
        ← 목록으로
      </Link>

      {/* 질문 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
            {post.subject_name}
          </span>
          {post.is_anonymous === 1 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">익명</span>
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">{post.title}</h1>
        <p className="text-sm text-gray-400 mb-4">{post.username} · {post.created_at?.slice(0, 10)}</p>
        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>

        {user?.id === post.user_id && (
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
            <button onClick={handleDeletePost}
              className="text-sm text-red-500 hover:text-red-700">삭제</button>
          </div>
        )}
      </div>

      {/* 댓글 목록 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          답변 {comments.length}개
        </h2>

        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">아직 답변이 없어요. 첫 답변을 남겨보세요!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {c.username}
                    {c.is_anonymous === 1 && (
                      <span className="ml-1 text-xs text-gray-400">(익명)</span>
                    )}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{c.created_at?.slice(0, 10)}</span>
                    {user?.id === c.user_id && (
                      <button onClick={() => handleDeleteComment(c.id)}
                        className="text-xs text-red-400 hover:text-red-600">삭제</button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 댓글 작성 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">답변 작성</h2>
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <textarea
            value={commentForm.content}
            onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
            rows={3}
            placeholder="답변을 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={commentForm.is_anonymous}
                onChange={(e) => setCommentForm({ ...commentForm, is_anonymous: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-600"
              />
              <span className="text-sm text-gray-600">익명으로 작성</span>
            </label>
            <button type="submit" disabled={submitting || !commentForm.content.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-5 py-2 rounded-lg transition">
              {submitting ? '등록 중...' : '답변 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QnaDetailPage;
