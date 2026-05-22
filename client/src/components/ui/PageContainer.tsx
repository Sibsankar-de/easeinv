import React from 'react';

export function PageContainer({ children }: { children: React.ReactNode }) {
    return (
        <div className='mt-5 mb-10 mx-6'>
            {children}
        </div>
    )
}
