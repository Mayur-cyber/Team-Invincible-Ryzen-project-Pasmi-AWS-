import { useState } from "react";
import { Upload, X, Check, Copy, Wand2, Image as ImageIcon, Type, Hash, Share2, Youtube, Instagram, Facebook, Twitter, CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { dashboardApi, AIProcessResponse } from "../../services/dashboardApi";

export default function CreatePost() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"upload" | "processing" | "review" | "success">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedTitle, setSelectedTitle] = useState(0);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    youtube: true,
    instagram: true,
    facebook: true,
    twitter: true
  });

  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [generatedHashtags, setGeneratedHashtags] = useState<string>("");
  const [generatedThumbnails, setGeneratedThumbnails] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startProcessing = async () => {
    if (!file) return;
    setStep("processing");

    // Start an artificial progress bar that slows down near the end, capped at 95%
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(p => {
        const increment = p < 85 ? 5 : 1;
        return Math.min(p + increment, 95); // Cap at 95% until API completes
      });
    }, 1500);

    try {
      // Call actual backend
      const res: AIProcessResponse = await dashboardApi.generateAI(file);

      setGeneratedTitles(res.titles || []);
      setGeneratedHashtags(res.hashtags || "");
      setGeneratedThumbnails(res.thumbnails || []);

      clearInterval(progressInterval);
      setProgress(100);

      // small delay to show 100%
      setTimeout(() => setStep("review"), 800);
    } catch (error) {
      console.error("AI Generation failed:", error);
      clearInterval(progressInterval);
      toast.error("Failed to generate AI content. Please try again.");
      setStep("upload");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold tracking-tight text-[#3A4D50]">Create New Post</h2>
        <p className="text-gray-500 mt-1">Upload your video and let Pasmi AI handle the rest.</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="border-2 border-dashed border-[#8FA58F]/30 rounded-2xl p-12 text-center hover:bg-white/50 hover:border-[#8FA58F]/50 transition-all cursor-pointer bg-white/60 backdrop-blur-xl shadow-xl"
            onClick={() => document.getElementById("video-upload")?.click()}
          >
            <input
              type="file"
              id="video-upload"
              className="hidden"
              accept="video/*"
              onChange={handleFileChange}
            />
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-[#8FA58F]/20 to-[#3A4D50]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#3A4D50] border border-[#8FA58F]/20"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Upload size={32} />
            </motion.div>
            <h3 className="text-xl font-semibold text-[#3A4D50] mb-2">
              {file ? file.name : "Drag and drop video here"}
            </h3>
            <p className="text-gray-500 mb-6">
              {file ? "Click to change file" : "or click to browse from your computer"}
            </p>
            {file && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={(e) => { e.stopPropagation(); startProcessing(); }}
                  className="bg-gradient-to-r from-[#3A4D50] to-[#2F3E40] hover:from-[#2F3E40] hover:to-[#3A4D50] text-white px-8 shadow-lg"
                >
                  Start AI Analysis
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="bg-white/70 backdrop-blur-xl border border-white/20 p-12 rounded-2xl shadow-2xl text-center max-w-lg mx-auto"
          >
            <div className="w-20 h-20 mx-auto mb-6 relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-[#8FA58F] border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center justify-center"
              >
                <Wand2 className="text-[#3A4D50]" size={24} />
              </motion.div>
            </div>
            <h3 className="text-xl font-semibold text-[#3A4D50] mb-2">Analyzing Content...</h3>
            <p className="text-gray-500 mb-6">Generating titles, thumbnails, and hashtags.</p>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-[#8FA58F] to-[#3A4D50] h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{progress}% Complete</p>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Left Column: AI Suggestions */}
            <div className="lg:col-span-2 space-y-6">

              {/* Thumbnails */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-300"
              >
                <h3 className="flex items-center gap-2 text-[#3A4D50] font-semibold mb-4">
                  <ImageIcon size={20} /> AI Thumbnails
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {generatedThumbnails.length > 0 ? (
                    generatedThumbnails.map((thumbStr, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden cursor-pointer border-2 transition-all
                          ${selectedThumb === index ? "border-[#3A4D50] ring-4 ring-[#3A4D50]/20 shadow-lg" : "border-transparent hover:border-[#8FA58F]/50"}
                        `}
                        onClick={() => setSelectedThumb(index)}
                      >
                        <img src={thumbStr} alt={`AI Thumbnail Option ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          Option {index + 1}
                        </div>
                        {selectedThumb === index && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 bg-[#3A4D50] text-white rounded-full p-1.5 shadow-lg"
                          >
                            <Check size={14} />
                          </motion.div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-3 text-sm text-gray-400 p-4 border rounded-xl text-center">
                      No thumbnails generated.
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Titles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-300"
              >
                <h3 className="flex items-center gap-2 text-[#3A4D50] font-semibold mb-4">
                  <Type size={20} /> Optimized Titles
                </h3>
                <div className="space-y-3">
                  {generatedTitles.map((title, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        p-4 rounded-xl border cursor-pointer flex items-center justify-between group transition-all
                        ${selectedTitle === index ? "bg-gradient-to-r from-[#8FA58F]/20 to-[#3A4D50]/10 border-[#8FA58F] text-[#3A4D50] shadow-md" : "border-gray-200/50 hover:border-[#8FA58F]/30 text-gray-600 hover:bg-white/50"}
                      `}
                      onClick={() => setSelectedTitle(index)}
                    >
                      <span className="font-medium text-sm md:text-base">{title}</span>
                      {selectedTitle === index && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Check size={18} className="text-[#3A4D50]" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Hashtags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-300"
              >
                <h3 className="flex items-center gap-2 text-[#3A4D50] font-semibold mb-4">
                  <Hash size={20} /> Trending Hashtags
                </h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 rounded-xl border border-gray-200/50 text-sm text-gray-600 leading-relaxed relative group">
                  {generatedHashtags}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedHashtags);
                        toast.success("Hashtags copied!");
                      }}
                    >
                      <Copy size={16} />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Preview & Publish */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-gradient-to-br from-[#3A4D50] to-[#2F3E40] text-white border-none shadow-2xl rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-white flex items-center gap-2 font-semibold mb-4">
                  <Share2 size={20} /> Publish to
                </h3>
                <div className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { icon: Youtube, name: "YouTube", key: "youtube" },
                      { icon: Instagram, name: "Instagram", key: "instagram" },
                      { icon: Facebook, name: "Facebook", key: "facebook" },
                      { icon: Twitter, name: "Twitter", key: "twitter" }
                    ].map(({ icon: Icon, name, key }, i) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border
                          ${selectedPlatforms[key as keyof typeof selectedPlatforms]
                            ? 'bg-white/20 border-[#8FA58F] shadow-lg'
                            : 'bg-white/10 border-white/20 hover:bg-white/15'
                          }
                        `}
                        onClick={() => setSelectedPlatforms(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      >
                        <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <Icon size={20} className="text-white" />
                        </div>
                        <span className="flex-1 font-medium text-white">{name}</span>
                        <div className={`
                          w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                          ${selectedPlatforms[key as keyof typeof selectedPlatforms]
                            ? 'bg-[#3A8BFF] border-[#3A8BFF]'
                            : 'border-white/40 bg-white/10'
                          }
                        `}>
                          {selectedPlatforms[key as keyof typeof selectedPlatforms] && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Check size={14} className="text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium mb-3 text-gray-200">Preview</h4>
                    <div className="bg-white rounded-xl overflow-hidden text-gray-900 shadow-2xl">
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                        {generatedThumbnails[selectedThumb] ? (
                          <img src={generatedThumbnails[selectedThumb]} alt="Selected Thumbnail Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-gray-400" size={32} />
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-bold text-sm line-clamp-2">{generatedTitles[selectedTitle]}</p>
                        <p className="text-xs text-blue-600 mt-2 line-clamp-1">{generatedHashtags}</p>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => {
                        toast.success("Posting to all channels...");
                        setTimeout(() => setStep("success"), 1000);
                      }}
                      className="w-full bg-gradient-to-r from-[#8FA58F] to-[#7A9080] hover:from-[#7A9080] hover:to-[#8FA58F] text-white mt-4 font-bold shadow-lg py-6"
                    >
                      Post to All Channels
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="bg-white/70 backdrop-blur-xl border border-white/20 p-12 rounded-2xl shadow-2xl text-center max-w-2xl mx-auto"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
              className="w-24 h-24 mx-auto mb-6 relative flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#8FA58F]/20 to-[#3A4D50]/20 rounded-full blur-xl"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#8FA58F] to-[#7A9080] rounded-full flex items-center justify-center shadow-xl">
                <CheckCircle2 className="text-white" size={48} strokeWidth={2.5} />
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-3xl font-bold text-[#3A4D50] mb-3">Successfully Posted!</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your content has been published to all selected channels. View detailed performance metrics and insights.
              </p>
            </motion.div>

            {/* Platform Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-3 mb-8 max-w-md mx-auto"
            >
              {Object.entries(selectedPlatforms)
                .filter(([_, selected]) => selected)
                .map(([key, _], i) => {
                  const platformData = {
                    youtube: { icon: Youtube, name: "YouTube", color: "text-red-600" },
                    instagram: { icon: Instagram, name: "Instagram", color: "text-pink-600" },
                    facebook: { icon: Facebook, name: "Facebook", color: "text-blue-600" },
                    twitter: { icon: Twitter, name: "Twitter", color: "text-sky-600" }
                  };
                  const data = platformData[key as keyof typeof platformData];
                  const Icon = data.icon;

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center gap-2 bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border border-gray-200/50 shadow-sm"
                    >
                      <div className={`${data.color}`}>
                        <Icon size={20} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{data.name}</span>
                      <Check size={16} className="ml-auto text-[#8FA58F]" strokeWidth={3} />
                    </motion.div>
                  );
                })}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate("/dashboard/analytics")}
                  className="bg-gradient-to-r from-[#3A4D50] to-[#2F3E40] hover:from-[#2F3E40] hover:to-[#3A4D50] text-white px-8 py-6 shadow-lg font-bold"
                >
                  <TrendingUp size={20} className="mr-2" />
                  View Analytics
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => {
                    setStep("upload");
                    setFile(null);
                    setProgress(0);
                  }}
                  variant="outline"
                  className="px-8 py-6 border-2 border-[#8FA58F]/30 text-[#3A4D50] hover:bg-[#8FA58F]/10 hover:border-[#8FA58F] font-bold"
                >
                  Create Another Post
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}