import React from 'react'

const TemplatesLayout = ({
    children,
}: {
    children: React.ReactNode
}) => {
    return (
        <div className="w-full flex-1 max-w-7xl mx-auto">
            {children}
        </div>
    )
}

export default TemplatesLayout

