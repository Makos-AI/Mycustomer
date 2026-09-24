# MyCustomer — Product Documentation

**MyCustomer** is a lightweight, decentralized booking ledger and CRM designed to formalize and secure the existing shadow market of offline transit arrangements in Nigeria. Rather than competing as an open marketplace, it allows riders and drivers to manage pre-existing trust relationships without platform commissions or artificial operational constraints.

---

## 🌟 Comprehensive Feature List

### 1. Web-Native Onboarding & Authentication
* **Passwordless Magic Links:** Seamless, frictionless login using secure email links, eliminating the need to remember passwords or pay for SMS OTPs.
* **Progressive Web App (PWA):** Installable directly from the browser to the mobile home screen (via Serwist), bypassing app store friction and approval delays.
* **Role-Based Profiles:** Users can specify if they intend to use the platform as a Rider, Driver, or Both.

### 2. Decentralized Contact & Invite System
* **Social Graph Reliance:** No random driver matching. Trust is pushed to the user's existing social network.
* **Personalized Invite Links:** Deep links generated per user that can be sent via WhatsApp or standard text messages.
* **In-Person QR Code Invites:** Drivers or riders can instantly generate a QR code for a trusted contact to scan in the physical world.

### 3. Chat-First Booking Interface
* **WhatsApp-Style Threading:** Familiar messaging UI where all interactions (chats, bookings, milestones) occur within the context of a specific driver-rider relationship.
* **Live Location Integration:** Drivers can easily paste their standard WhatsApp Live Location link into their profile or chat to share their real-time whereabouts, outsourcing heavy background location tracking to a trusted native app.

### 4. Contextual Booking Engine
* **Flexible Scheduling Windows:** Instead of rigid timestamps, riders book flexible pickup windows (e.g., 7:45 AM – 8:15 AM) giving drivers operational breathing room.
* **Google Maps Route Visualization:** Visual route rendering between pickup and dropoff points.
* **Uncapped Custom Pricing:** Auto-generates a baseline fare based on distance (using Google Distance Matrix/Directions API), but allows users 100% freedom to adjust offers up or down.
* **One-Tap Operational Modifiers:** Toggle chips (e.g., "AC On", "Extra Luggage") that instantly add premium increments to the proposed fare.

### 5. Frictionless Negotiation UI
* **Bottom-Sheet Counter Offers:** Drivers receive offers and can counter them via a touch-friendly drawer without needing to type text.
* **Contextual Excuse Tags:** Drivers justify counter-offers using one-tap tags like *"Severe Traffic"*, *"Flooded Route"*, *"Agbero/Community Tolls"*, or *"Fuel Station Queue"*.

### 6. The Reliability Ledger
* **Dynamic Completion Score:** A highly visible percentage score pinned to a driver's profile, calculated as `Completed Rides / Total Accepted Rides`.
* **Visual Trust Badging:** Color-coded UI indicators (Green >90%, Yellow >70%, Red <70%) visible in the chat list and profile.
* **Non-Gameable:** Canceled rides only negatively impact the score if they were canceled *after* the driver accepted the booking.

### 7. Conditional Privacy & Payments
* **Public Profile Obfuscation:** Strangers can only see a driver’s Name, Phone, Car Make/Model, and Plate Number.
* **Contact-Gated Bank Details:** Once a rider adds a driver as a saved contact, the driver's Bank Name and Account Number unlock for seamless, zero-commission offline transfers.

### 8. Relational Milestones (Social Triggers)
* **Automated Celebrations:** The database tracks shared history between specific rider-driver pairs.
* **In-Chat Milestone Cards:** Crossing thresholds (e.g., "1st Trip Together", "25 Trips", "100km Traveled") automatically injects a visually rich, celebratory card into the chat thread to reinforce interpersonal loyalty.

---

## 🛠 Technical Architecture

* **Frontend Framework:** Next.js 14+ (App Router) with React
* **Design System:** Tailwind CSS with custom glassmorphic dark-mode utilities
* **PWA Engine:** `@serwist/next` (Service workers, offline caching, installability)
* **Backend & Database:** Supabase (PostgreSQL)
* **Authentication:** Supabase Auth (Email Magic Links)
* **Real-time Engine:** Supabase Realtime (WebSockets for chat and live booking updates)
* **Mapping:** Google Maps JavaScript API (Places Autocomplete, Directions, Distance Matrix)
* **Deployment (Recommended):** Vercel

---

## 🗄️ Core Database Schema (PostgreSQL)

| Table | Purpose | Key Fields |
|---|---|---|
| `profiles` | Extended user data | `role`, `completion_rate`, `car_make_model`, `plate_number`, `bank_name`, `account_number` |
| `contacts` | The decentralized social graph | `user_id`, `contact_id`, `nickname` |
| `conversations` | Chat thread containers | `id`, `created_at`, `updated_at` |
| `chat_messages` | Thread items | `sender_id`, `content`, `type (text, booking, milestone)` |
| `bookings` | Core transaction ledger | `pickup_window`, `distance_km`, `agreed_fare`, `modifiers`, `status` |
| `fare_negotiations` | Counter-offer history | `proposed_fare`, `tags`, `note` |
| `rider_driver_stats` | Milestone tracking | `total_trips`, `total_distance_km`, `total_spent` |

---

## 🔄 User Workflows

### The Driver Onboarding Flow
1. Driver opens the PWA URL and enters their email.
2. Clicks the Magic Link in their inbox to authenticate.
3. Fills out Display Name, uploads a Photo, and selects "Driver" role.
4. Updates Profile with Vehicle details (Car Make, Plate) and Payment details (Bank Name, Account No).
5. Opens `Invite Contacts`, generating a QR code for their existing riders to scan.

### The Booking & Negotiation Flow
1. Rider opens a Chat thread with a trusted Driver and taps "Book".
2. Rider selects a 30-minute flexible window, adds "AC On", and proposes a custom fare.
3. Driver receives the offer. They see heavy traffic, so they tap the `+` button to add ₦500, tap the `"Severe Traffic"` tag, and hit Send Counter.
4. Rider accepts the counter-offer. Ride status transitions to `accepted`.
5. Upon completion, the ride ends. If it was their 5th ride together, an animated milestone card automatically drops into their chat thread.
