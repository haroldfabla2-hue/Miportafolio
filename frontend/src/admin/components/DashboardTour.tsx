import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import type { CallBackProps, Step } from 'react-joyride';
import { useTour } from '../../context/TourContext';
import { useAuth } from '../../context/AuthContext';

const DashboardTour: React.FC = () => {
    const { hasSeenTour, markTourAsSeen } = useTour();
    const { user } = useAuth();
    const [run, setRun] = useState(false);

    useEffect(() => {
        // Run tour if user hasn't seen it and is authenticated
        if (user && !hasSeenTour('dashboard')) {
            setRun(true);
        }
    }, [user, hasSeenTour]);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            markTourAsSeen('dashboard');
        }
    };

    const steps: Step[] = [
        {
            target: 'body',
            placement: 'center',
            content: (
                <div>
                    <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem' }}>Welcome to Iris CRM! 🚀</h3>
                    <p style={{ margin: 0 }}>Let's take a quick tour to help you get started.</p>
                </div>
            ),
            disableBeacon: true,
        },
        {
            target: '.admin-sidebar',
            content: (
                <div>
                    <h4 style={{ margin: '0 0 8px' }}>Navigation</h4>
                    <p style={{ margin: 0 }}>Here you can access all modules: Projects, Clients, Finance, and more.</p>
                </div>
            ),
            placement: 'right',
        },
        {
            target: '.admin-search',
            content: 'Use this bar to quickly find any project, task, or client.',
            placement: 'bottom',
        },
        {
            target: '.admin-notification-btn',
            content: 'Stay updated with real-time notifications about your projects.',
            placement: 'bottom',
        },
        {
            target: '#iris-float-btn',
            content: (
                <div>
                    <h4 style={{ margin: '0 0 8px' }}>Meet Iris AI 🤖</h4>
                    <p style={{ margin: 0 }}>Your intelligent assistant. Click here to ask questions, generate content, or get help.</p>
                </div>
            ),
            placement: 'left',
        },
    ];

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#a3ff47',
                    textColor: '#333',
                    backgroundColor: '#fff',
                },
                buttonNext: {
                    backgroundColor: '#000',
                    color: '#a3ff47',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    borderRadius: '4px',
                },
                buttonBack: {
                    color: '#666',
                    marginRight: '10px',
                },
                buttonSkip: {
                    color: '#999',
                }
            }}
            locale={{
                last: 'Finish',
            }}
        />
    );
};

export default DashboardTour;
