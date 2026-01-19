import React from 'react';
import { DollarSign, Briefcase, TrendingUp, Activity } from 'lucide-react';

const KPICard = ({ title, value, subtext, icon: Icon, gradient, iconColor }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group
        bg-white dark:bg-gradient-to-br dark:${gradient} 
        border border-gray-100 dark:border-none
    `}>
        {/* Decorative blob - Only visible in Dark Mode */}
        <div className="hidden dark:block absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>

        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-white/90 mb-1">{title}</p>
                <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</h3>
                {subtext && (
                    <p className="text-xs font-medium mt-3 px-2 py-1 rounded-lg inline-block 
                        bg-gray-100 text-gray-600 border border-gray-200
                        dark:bg-white/20 dark:text-white dark:border-white/10 dark:backdrop-blur-sm
                    ">
                        {subtext}
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-xl shadow-sm dark:shadow-inner
                bg-gray-50 dark:bg-white/20 
                border border-gray-100 dark:border-white/10
            `}>
                <Icon className={`w-6 h-6 ${iconColor} dark:text-white`} />
            </div>
        </div>
    </div>
);

const AnalyticsKPIs = ({ data }) => {
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
                title="Total Revenue"
                value={`SAR ${Number(data.totalRevenue).toLocaleString()}`}
                subtext="+12.5% vs last month"
                icon={DollarSign}
                gradient="from-blue-600 to-blue-400"
                iconColor="text-blue-600"
            />
            <KPICard
                title="Win Rate"
                value={`${data.winRate}%`}
                subtext="Conversion Strength"
                icon={TrendingUp}
                gradient="from-emerald-500 to-emerald-300"
                iconColor="text-emerald-600"
            />
            <KPICard
                title="Active Jobs"
                value={data.activeJobs}
                subtext="Projects In Pipeline"
                icon={Activity}
                gradient="from-violet-600 to-violet-400"
                iconColor="text-violet-600"
            />
            <KPICard
                title="Total Quotes"
                value={data.totalQuotes}
                subtext="Lifetime Generated"
                icon={Briefcase}
                gradient="from-amber-500 to-amber-300"
                iconColor="text-amber-600"
            />
        </div>
    );
};

export default AnalyticsKPIs;
