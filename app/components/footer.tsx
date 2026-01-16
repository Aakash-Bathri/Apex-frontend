import { FaHeart, FaLinkedin } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="w-full py-6 mt-auto text-center">
            <div className="flex items-center justify-center gap-2 text-white/50 text-sm font-medium">
                <span>Crafted with</span>
                <FaHeart className="text-red-500 animate-pulse" />
                <span>by</span>
                <a
                    href="https://www.linkedin.com/in/aakash-bathri/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-cyan-400 transition-colors flex items-center gap-1 group"
                >
                    Aakash Bathri
                    <FaLinkedin className="group-hover:text-[#0077b5] transition-colors" />
                </a>
            </div>
        </footer>
    );
}
