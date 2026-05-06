import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Heart, Image as ImageIcon, Send, X, Loader2, Trash2, User as UserIcon } from 'lucide-react';
import Navbar from '../components/navbar';
import Footer from '../components/contact';
import { motion, AnimatePresence } from 'framer-motion';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSaving] = useState(false);
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPosts();
    const userStr = localStorage.getItem('currentUser');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/forum');
      const data = await res.json();
      if (res.ok) setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 5) {
      alert("Maximum 5 images autorisées");
      return;
    }
    
    setSelectedImages([...selectedImages, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    const formData = new FormData();
    formData.append('content', content);
    selectedImages.forEach(img => formData.append('images', img));

    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const newPost = await res.json();
      if (res.ok) {
        setPosts([newPost, ...posts]);
        setContent("");
        setSelectedImages([]);
        setPreviews([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser) return alert("Connectez-vous pour aimer ce post");
    try {
      const res = await fetch(`/api/forum/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const likes = await res.json();
      if (res.ok) {
        setPosts(posts.map(p => p._id === postId ? { ...p, likes } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId, commentContent) => {
    if (!commentContent.trim()) return;
    try {
      const res = await fetch(`/api/forum/${postId}/comment`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentContent })
      });
      const comments = await res.json();
      if (res.ok) {
        setPosts(posts.map(p => p._id === postId ? { ...p, comments } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Supprimer ce post ?")) return;
    try {
      const res = await fetch(`/api/forum/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setPosts(posts.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSidebar={false} />
      
      <div className="pt-32 pb-12 px-4 max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <MessageSquare size={40} className="text-blue-600" />
            Forum FixIt
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Partagez vos expériences et posez vos questions.</p>
        </header>

        {/* Create Post Form */}
        {currentUser && (
          <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-6 mb-10">
            <form onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex-shrink-0 overflow-hidden">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-600">
                      <UserIcon size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Quoi de neuf, ${currentUser.username} ?`}
                    className="w-full min-h-[120px] p-4 bg-gray-50 border-none rounded-[24px] focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-800 leading-relaxed"
                  />
                  
                  <AnimatePresence>
                    {previews.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-5 gap-2 mt-4"
                      >
                        {previews.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition cursor-pointer"
                    >
                      <ImageIcon size={20} />
                      <span>Photos (max 5)</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    
                    <button
                      type="submit"
                      disabled={submitting || !content.trim()}
                      className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                      Publier
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                currentUser={currentUser} 
                onLike={handleLike} 
                onComment={handleComment}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold text-xl">Aucun message pour le moment.</p>
              <p className="text-gray-400">Soyez le premier à partager quelque chose !</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const PostCard = ({ post, currentUser, onLike, onComment, onDelete }) => {
  const [commentText, setCommentContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const isLiked = currentUser && post.likes?.includes(currentUser._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <UserIcon size={20} />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-black text-gray-900 leading-none">{post.author.username}</h3>
              <span className="text-[10px] text-gray-400 uppercase font-black">{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>
          {(currentUser?.role === 'admin' || currentUser?._id === post.author._id) && (
            <button 
              onClick={() => onDelete(post._id)}
              className="p-2 text-gray-400 hover:text-red-500 transition"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <p className="text-gray-800 leading-loose whitespace-pre-wrap mb-4">{post.content}</p>

        {post.images?.length > 0 && (
          <div className={`grid gap-2 mb-4 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.images.map((img, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                <img src={img} alt="" className="w-full h-full object-cover max-h-[400px]" />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
          <button 
            onClick={() => onLike(post._id)}
            className={`flex items-center gap-2 font-bold transition ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            <span>{post.likes?.length || 0}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold transition"
          >
            <MessageSquare size={20} />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="bg-gray-50/50 border-t border-gray-50 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {post.comments?.map((comment, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white overflow-hidden flex-shrink-0 shadow-sm">
                    {comment.author?.avatar ? (
                      <img src={comment.author.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <UserIcon size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black text-gray-900">{comment.author?.username}</span>
                      <span className="text-[9px] text-gray-400 font-bold">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}

              {currentUser && (
                <div className="flex gap-3 pt-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Votre commentaire..."
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-shadow pr-12"
                      onKeyPress={(e) => e.key === 'Enter' && (onComment(post._id, commentText), setCommentContent(""))}
                    />
                    <button 
                      onClick={() => { onComment(post._id, commentText); setCommentContent(""); }}
                      className="absolute right-2 top-1.5 p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Forum;
