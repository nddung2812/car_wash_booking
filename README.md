# Sparkles Car Wash - Booking App

A modern, responsive car wash booking application for Sparkles Car Wash built with Next.js 15, Tailwind CSS 3, and ShadCN UI components.

## 🚗 Features

- **Responsive Header Navigation** - Sticky header with mobile-friendly navigation
- **Interactive Banner Slider** - Auto-playing carousel showcasing services
- **Comprehensive Booking Form** - Multi-step form with validation for service booking
- **Customer Reviews Section** - Display customer testimonials and ratings
- **Login/Registration Portal** - Secure customer authentication system
- **Service Showcase** - Detailed pricing and feature comparison
- **Contact Information** - Business hours and location details

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **UI Components**: ShadCN UI
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd car-wash-booking
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Components

### Header Component

- Responsive navigation with mobile menu
- Contact information display
- Login/Registration integration
- Smooth scroll navigation

### Banner Slider

- Auto-playing carousel (5-second intervals)
- Manual navigation controls
- Responsive design with gradient overlays
- Service-specific call-to-action buttons

### Booking Form

- Multi-step service selection
- Date and time slot picker
- Customer information collection
- Form validation with error messages
- Real-time booking summary

### Reviews Section

- Customer testimonials grid
- Star rating system
- Statistics display (customers, ratings, etc.)
- Verified customer badges

### Login Portal

- Dual-mode: Login and Registration
- Form validation and error handling
- Password visibility toggle
- Responsive modal design

## 🎨 Design Features

- **Modern UI**: Clean, professional design with blue color scheme
- **Responsive**: Fully responsive across all device sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Optimized with Next.js 15 features
- **Animations**: Smooth transitions and hover effects

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Configuration

The project uses:

- **ShadCN Configuration**: Located in `components.json`
- **Tailwind Config**: Using Tailwind CSS 4 with latest features
- **TypeScript Config**: Strict type checking enabled

## 📂 Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # ShadCN UI components
│   ├── Header.tsx
│   ├── BannerSlider.tsx
│   ├── BookingForm.tsx
│   ├── ReviewsSection.tsx
│   └── LoginPortal.tsx
└── lib/
    └── utils.ts      # Utility functions
```

## 🎯 Key Features Explained

### Service Booking System

- **Service Selection**: Visual cards with pricing and features
- **Vehicle Type Selection**: Dropdown with multiple vehicle options
- **Date/Time Picker**: Prevents past date selection, shows available slots
- **Customer Info**: Comprehensive form with validation
- **Special Instructions**: Optional textarea for customer notes

### User Authentication

- **Login Form**: Email/password with remember me option
- **Registration**: Full signup form with password confirmation
- **Validation**: Real-time form validation using Zod schemas
- **Security**: Password visibility toggles and strength requirements

### Reviews & Testimonials

- **Star Ratings**: Visual 5-star rating system
- **Customer Cards**: Professional layout with avatars and verification badges
- **Statistics**: Dynamic calculation of average ratings and totals
- **Responsive Grid**: Adapts to different screen sizes

## 🔮 Future Enhancements

- Payment processing integration
- Real-time booking availability
- Email confirmations
- Admin dashboard
- Google Maps integration
- Push notifications
- Customer loyalty program
- Multi-language support

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@cleancar.com or create an issue in this repository.

---

Built with ❤️ using Next.js 15 and modern web technologies.
