import { Link, useLocation } from "react-router-dom";
import { Search, Home, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";

export default function NotFound() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E8EDE3] via-[#F0F2EB] to-[#DDE5D5] flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Decorative Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8FA58F]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3A4D50]/10 rounded-full blur-[100px]" />

            <div className="max-w-xl w-full text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="relative inline-block">
                        <span className="text-[12rem] font-bold text-[#3A4D50]/5 leading-none select-none">404</span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center">
                                <Search size={48} className="text-[#8FA58F] animate-pulse" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold text-[#3A4D50] mb-4">Lost in Space?</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        We couldn't find the page you're looking for: <br />
                        <span className="font-mono bg-white/50 px-2 py-1 rounded border border-[#8FA58F]/20 text-[#8FA58F]">
                            {location.pathname}
                        </span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => window.history.back()}
                            className="bg-white hover:bg-gray-50 text-[#3A4D50] border border-gray-200 rounded-2xl py-6 px-8 flex items-center gap-2 shadow-sm transition-all"
                        >
                            <ArrowLeft size={20} />
                            Go Back
                        </Button>

                        <Link to="/">
                            <Button
                                className="bg-[#8FA58F] hover:bg-[#7A9080] text-white rounded-2xl py-6 px-8 flex items-center gap-2 shadow-lg shadow-[#8FA58F]/30 transition-all font-semibold"
                            >
                                <Home size={20} />
                                Return to Safety
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-gray-400 text-sm"
                >
                    <p>If you think this is a mistake, please reach out to our team.</p>
                </motion.div>
            </div>
        </div>
    );
}
