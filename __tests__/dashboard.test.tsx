import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/(protected)/dashboard/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
    usePathname: () => '/dashboard',
}))

describe('DashboardPage', () => {
    it('renders dashboard heading', () => {
        render(<DashboardPage />)
        expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    })

    it('renders summary cards', () => {
        render(<DashboardPage />)
        expect(screen.getByText(/total patients/i)).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /appointments today/i })).toBeInTheDocument()
        expect(screen.getByText(/active prescriptions/i)).toBeInTheDocument()
        expect(screen.getByText(/revenue/i)).toBeInTheDocument()
    })

    it('renders recent appointments', () => {
        render(<DashboardPage />)
        expect(screen.getByText(/recent appointments/i)).toBeInTheDocument()
        expect(screen.getByText(/olivia martin/i)).toBeInTheDocument()
    })
})
