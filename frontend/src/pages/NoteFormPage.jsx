import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import api from '../api/axios';

const NoteFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ subject_id: '', title: '', content: '', is_public: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/subjects').then((res) => setSubjects(res.data.subjects));
    if (isEdit) {
      api.get(`/notes/${id}`).then((res) => {
        const n = res.data.note;
        setForm({ subject_id: n.subject_id, title: n.title, content: n.content, is_public: Boolean(n.is_public) });
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/notes/${id}`, form);
      } else {
        await api.post('/notes', form);
      }
      navigate('/notes');
    } catch (err) {
      setError(err.response?.data?.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? '✏️ 필기 수정' : '📖 필기 공유'}
      </h1>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">과목 *</label>
            <select
              value={form.subject_id}
              onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">선택하세요</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_public}
                onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-600"
              />
              <span className="text-sm text-gray-700">공개 필기로 설정</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="필기 제목을 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div data-color-mode="light">
          <label className="block text-sm font-medium text-gray-700 mb-1">내용 * (마크다운 지원)</label>
          <MDEditor
            value={form.content}
            onChange={(val) => setForm({ ...form, content: val || '' })}
            height={400}
            preview="live"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/notes')}
            className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition">
            취소
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium py-2.5 rounded-lg transition">
            {loading ? '저장 중...' : isEdit ? '수정 완료' : '필기 등록'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteFormPage;
