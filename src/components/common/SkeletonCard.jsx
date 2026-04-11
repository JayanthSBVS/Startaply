import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden flex flex-col h-full">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-100/50 to-transparent animate-[shimmer_1.5s_infinite]" />

            <div className="flex justify-between items-start mb-6">
                <div className="w-2/3">
                    <div className="h-5 bg-slate-200 rounded-lg w-full mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded-lg w-2/3"></div>
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded-lg"></div>
            </div>

            <div className="flex gap-3 mb-6">
                <div className="h-5 w-20 bg-slate-100 rounded-md"></div>
                <div className="h-5 w-20 bg-slate-100 rounded-md"></div>
            </div>

            <div className="space-y-3 mb-8 flex-grow">
                <div className="h-3 bg-slate-100 rounded-md w-full"></div>
                <div className="h-3 bg-slate-100 rounded-md w-[90%]"></div>
                <div className="h-3 bg-slate-100 rounded-md w-[75%]"></div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-auto">
                <div className="h-3 w-24 bg-slate-200 rounded-md"></div>
                <div className="h-4 w-20 bg-slate-200 rounded-md"></div>
            </div>
        </div>
    );
};

export default SkeletonCard;