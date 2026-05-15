import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const QuestionFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    subject_id: '',
    title: '',
    content: '',
    answer: '',
    explanation: '',
    difficulty: 'medium',
    image_url: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/subjects').then((res) => setSubjects(res.data.subjects));
    if (isEdit) {
      api.get(`/questions/${id}`).then((res) => {
        const q = res.data.question;
        setForm({
          subject_id: q.subject_id,
          title: q.title,
          content: q.content,
          answer: q.answer,
          explanation: q.explanation || '',
          difficulty: q.difficulty,
          image_url: q.image_url || '',
        });
        if (q.image_url) setImagePreview(q.image_url);
      });
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, image_url: res.data.imageUrl }));
      setImagePreview(res.data.imageUrl);
    } catch {
      setError('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image_url: '' }));
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/questions/${id}`, form);
      } else {
        await api.post('/questions', form);
      }
      navigate('/questions');
    } catch (err) {
      setError(err.response?.data?.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const difficultyOptions = [
    { value: 'easy', label: '쉬움', color: 'text-green-600' },
    { value: 'medium', label: '보통', color: 'text-yellow-600' },
    { value: 'hard', label: '어려움', color: 'text-red-600' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? '문제 수정' : '문제 출제'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit ? '문제 내용을 수정하세요' : '새로운 예상 문제를 출제해보세요'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 과목 & 난이도 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">기본 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">과목 *</label>
              <select
                name="subject_id"
                value={form.subject_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">선택하세요</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">난이도</label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {difficultyOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">제목 *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="예: 2단원 세포분열 핵심 문제"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 문제 내용 & 이미지 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">문제 내용</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">문제 내용 *</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              rows={5}
              placeholder="문제 내용을 자세히 작성하세요&#10;예: 다음 중 미토콘드리아의 기능으로 올바른 것은?"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              문제 이미지 <span className="text-gray-400 font-normal">(선택, 최대 5MB)</span>
            </label>

            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="업로드된 이미지"
                  className="max-h-48 rounded-xl border border-gray-200 object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="text-sm text-gray-400">업로드 중...</div>
                ) : (
                  <>
                    <div className="text-2xl mb-1 text-gray-300 group-hover:text-indigo-400 transition">📷</div>
                    <div className="text-sm text-gray-400 group-hover:text-indigo-500 transition">클릭하여 이미지 첨부</div>
                    <div className="text-xs text-gray-300 mt-0.5">JPG, PNG, GIF 지원</div>
                  </>
                )}
              </label>
            )}
          </div>
        </div>

        {/* 정답 & 해설 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">정답 & 해설</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">정답 *</label>
            <input
              type="text"
              name="answer"
              value={form.answer}
              onChange={handleChange}
              required
              placeholder="예: ②번 / x=2 또는 x=3 / 광합성 / 산화 환원 반응"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              객관식은 번호(②번), 주관식은 핵심 단어나 식을 입력하세요
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              해설 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <textarea
              name="explanation"
              value={form.explanation}
              onChange={handleChange}
              rows={3}
              placeholder="풀이 과정이나 핵심 개념을 설명하면 학습에 더 도움이 돼요"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/questions')}
            className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold py-3 rounded-xl transition shadow-sm"
          >
            {loading ? '저장 중...' : isEdit ? '수정 완료' : '문제 등록'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionFormPage;
