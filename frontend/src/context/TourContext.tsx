import React, { createContext, useContext, useState, useEffect } from 'react';

interface TourContextType {
    hasSeenTour: (tourId: string) => boolean;
    markTourAsSeen: (tourId: string) => void;
    resetTour: (tourId: string) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Load initial state from localStorage
    const [seenTours, setSeenTours] = useState<string[]>(() => {
        const saved = localStorage.getItem('silhouette_seen_tours');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('silhouette_seen_tours', JSON.stringify(seenTours));
    }, [seenTours]);

    const hasSeenTour = (tourId: string) => {
        return seenTours.includes(tourId);
    };

    const markTourAsSeen = (tourId: string) => {
        if (!seenTours.includes(tourId)) {
            setSeenTours(prev => [...prev, tourId]);
        }
    };

    const resetTour = (tourId: string) => {
        setSeenTours(prev => prev.filter(id => id !== tourId));
    };

    return (
        <TourContext.Provider value={{ hasSeenTour, markTourAsSeen, resetTour }}>
            {children}
        </TourContext.Provider>
    );
};

export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};
