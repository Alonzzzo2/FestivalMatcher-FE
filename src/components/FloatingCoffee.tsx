export default function FloatingCoffee() {
    return (
        <a
            href="https://www.buymeacoffee.com/festivalmatcher"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex items-center gap-2 bg-[#BD5FFF] hover:bg-[#a64ce0] text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-white/20 font-comic"
            style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif' }}
            aria-label="Buy me a coffee"
        >
            <img
                src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                alt="Buy me a coffee"
                className="w-6 h-6"
            />
            <span className="font-bold text-lg">Buy me a coffee</span>
        </a>
    );
}
