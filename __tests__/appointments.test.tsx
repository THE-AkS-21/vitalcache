import { render, screen, fireEvent } from '@testing-library/react'
import AppointmentsPage from '@/app/(protected)/appointments/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
    usePathname: () => '/appointments',
}))

describe('AppointmentsPage', () => {
    it('renders appointments heading', () => {
        render(<AppointmentsPage />)
        expect(screen.getByRole('heading', { name: /appointments/i })).toBeInTheDocument()
    })

    it('renders calendar', () => {
        render(<AppointmentsPage />)
        expect(screen.getByText(/calendar/i)).toBeInTheDocument()
    })

    it('opens new appointment dialog', () => {
        render(<AppointmentsPage />)
        const newButton = screen.getByRole('button', { name: /new appointment/i })
        fireEvent.click(newButton)
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText(/schedule a new appointment/i)).toBeInTheDocument()
    })
})
