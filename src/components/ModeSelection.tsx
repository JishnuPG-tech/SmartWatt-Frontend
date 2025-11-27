interface Props {
    onSelect: (mode: 'quick' | 'detailed') => void;
}

export default function ModeSelection({ onSelect }: Props) {
    return (
        <div className="w-full max-w-6xl mx-auto px-4 animate-in fade-in duration-700">
            {/* Main Header */}
            <div className="main-header">
                <h1>SMARTWATT</h1>
                <p>Kerala Energy Estimator</p>
            </div>

            <h3 className="text-center text-[#94a3b8] font-light tracking-widest mb-8 text-xl">
                Choose your estimation mode
            </h3>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Quick Estimate Card */}
                <div className="mode-card group">
                    <div>
                        <h2>Quick Estimate</h2>
                    </div>
                    <hr />
                    <div>
                        <ul>
                            <li>Fast setup process</li>
                            <li>Simple inputs required</li>
                            <li>Instant results</li>
                        </ul>
                    </div>
                    <hr />
                    <div className="mt-auto">
                        <p>
                            <span className="text-[#60a5fa] font-medium">Time:</span> 1-2 minutes
                        </p>
                        <p>
                            <span className="text-[#60a5fa] font-medium">Accuracy:</span> 80-85%
                        </p>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={() => onSelect('quick')}
                            className="st-button"
                        >
                            Start Quick Estimate
                        </button>
                    </div>
                </div>

                {/* Detailed Estimate Card */}
                <div className="mode-card group">
                    <div>
                        <h2>Detailed Estimate</h2>
                    </div>
                    <hr />
                    <div>
                        <ul>
                            <li>Detailed usage tracking</li>
                            <li>Appliance-specific settings</li>
                            <li>More accurate results</li>
                        </ul>
                    </div>
                    <hr />
                    <div className="mt-auto">
                        <p>
                            <span className="text-[#60a5fa] font-medium">Time:</span> 3-5 minutes
                        </p>
                        <p>
                            <span className="text-[#60a5fa] font-medium">Accuracy:</span> 90-95%
                        </p>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={() => onSelect('detailed')}
                            className="st-button"
                        >
                            Start Detailed Estimate
                        </button>
                    </div>
                </div>
            </div>

            <div className="st-alert-info mt-8 text-center">
                Not sure? Start with Quick Estimate - you can upgrade to Detailed later!
            </div>
        </div>
    );
}