import React from 'react';
import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title }) => (
    <div className="h-full flex flex-col items-center justify-center text-gray-500 animate-in fade-in duration-300">
        <Construction size={48} className="mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-gray-300">{title}</h2>
        <p>Module under development.</p>
    </div>
);

export default PlaceholderPage;
