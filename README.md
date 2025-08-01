[中文版](README_ZH.md) | English
# Soul Comfort (Project Soul-Comfort)

A web application designed to provide understanding, support, and encouragement for modern people.

## 💡 Project Vision

In this fast-paced, stressful society, we believe everyone needs a corner where they can find momentary peace and draw spiritual strength. This project aims to be a warm harbor, providing positive emotional value through carefully selected words and intelligent interaction.

## 🚀 Core Features

This website plans to implement the following core features:

1. **Daily Affirmation:** The core foundation of the website. Every time users visit, they can see a sentence that can provoke thought or bring strength.
2. **AI Emotional Tree Hole:** Users can input their current emotions or thoughts, and AI will act as an empathetic listener, providing support and positive guidance.
3. **Argument King Mode:** A unique and interesting feature. When users haven't performed well in an argument, they can describe the scenario here, and AI will help them devise sharp, humorous, and logically clear "comeback" strategies.

## 🗺️ Development Roadmap

We will adopt a phased, iterative development strategy and follow the **"Validate with Free First, Monetize Later"** business model.

### **Phase 1: Minimum Viable Product (MVP) - Free**

* **Core Goal:** Build and launch a high-quality, free-to-use "Daily Quote" website.
* **Business Purpose:** Quickly validate the product's core value, accumulate early users and feedback, and lay a solid foundation for subsequent iterations and commercialization.
* **Specific Tasks:**
    * Implement the display of "Daily Quote" on the homepage.
    * Create content category pages for browsing all quotes.
    * Invest effort in planning and screening a batch of high-quality seed content.
    * Design a clean, beautiful, responsive UI interface.
    * Set up a Supabase database for storing and managing content.

### **Phase 2: Introducing AI Interaction**

* **Goal:** Based on the free version, integrate AI models to implement the "AI Emotional Tree Hole" feature.
* **Cost Control:** To control API call costs, daily free usage limits may be set for anonymous users or all users.
* **Specific Tasks:**
    * Design user interaction interface.
    * Write backend API routes for securely calling AI services.
    * Design and optimize AI prompts and add necessary safety guardrails.
    * Add disclaimers to the interface.

### **Phase 3: Expanding Featured Functions**

* **Goal:** Launch the "Argument King" mode, forming a unique differentiation advantage for the product.

### **Phase 4: Commercial Exploration**

* **Goal:** Based on users and data accumulated in previous phases, introduce paid models (such as subscription or pay-per-use).
* **Prerequisite:** Only launch this phase when data proves the product has sufficiently high value for users.

## 🛠️ Technology Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Database/Backend:** Supabase
* **UI Styling:** Tailwind CSS
* **UI Components:** Shadcn UI
* **AI Service:** ZhipuAI GLM-4 API introduced in Phase 2
* **Deployment:** Vercel

## ⚖️ Risks & Considerations

Before development, we must face the following challenges:

1. **Content Quality:** The value of the website highly depends on the quality of content. Effort must be invested in planning and screening original content that truly touches hearts, avoiding clichés.
2. **AI Cost and Responsibility:** After launching AI features, API calls will generate ongoing costs, and cost monitoring must be done well. More importantly, as a service providing emotional support, we have ethical and safety responsibilities and must set clear disclaimers and technical safety guardrails to prevent AI from providing harmful advice.
3. **Market Competition:** To stand out among similar products, in addition to unique features (such as the "Argument King" mode), excellence in UI/UX design and brand style is also needed.

## 📝 Future Improvements

### **Content Iteration Strategy**
* **Classification System Building**: Build a content library based on themes (growth, setbacks, interpersonal relationships, etc.), emotional needs (encouragement, comfort, inspiration, etc.), and life scenarios (work pressure, academic challenges, interpersonal conflicts, etc.)
* **Content Quality Control**: Establish content screening standards to ensure each sentence has depth of thought and emotional resonance
* **Regular Update Mechanism**: Establish weekly/monthly content update plans to keep content fresh
* **User Feedback Collection**: Implement a content rating system to optimize content based on user feedback

### **Paid Model Design**
* **Tiered Membership System**:
  - Free Tier: Limited daily quote access, basic features
  - Basic Membership: Full content library access, limited AI interactions
  - Premium Membership: Unlimited AI interaction, exclusive content, advanced features
* **Channels for Obtaining Free Credits**:
  - Referral Rewards: Invite friends to register for free usage credits
  - Activity Participation: Complete surveys, share experiences, provide feedback for rewards
  - Content Contribution: Submit high-quality quotes and get rewarded when adopted
* **Technical Implementation Requirements**:
  - User authentication system (registration, login, account management)
  - Payment interface integration (subscription management, transaction records)
  - Credit management system (usage statistics, credit consumption and rewards)

### **Ethics and Security Protection**
* **Disclaimer Design**:
  - General disclaimer at the bottom of the website
  - Specific terms before using features (especially AI interaction features)
  - Clearly state that the website cannot replace professional psychological counseling
* **Content Security Mechanism**:
  - Review process for AI output content
  - Identification and appropriate handling of sensitive topics
  - Response mechanism for emergency situations (such as self-harm risk)

### **Innovative Feature Construction**
* **Personalized Recommendation System**: Recommend content based on user emotional state and historical interactions
* **Emotion Tracking Diary**: Record user emotional changes, provide visualization analysis
* **Community Support Function**: Anonymous sharing and mutual help, but with strict content review
* **Contextualized Content**: Push relevant content based on time, weather, or specific events
* **Visual Presentation Enhancement**: Combine quotes with beautiful backgrounds, support sharing to social media
* **Audio Experience**: Provide voice reading of quotes, accompanied by soothing background music

## 💡 Creative Brainstorming Area

*This is a place to record good ideas we might implement in the future.*

* Idea 1: Add a "Meditation Mode" that plays soothing music and switches sentences at timed intervals.
* Idea 2: Users can generate a beautiful image with their favorite quotes and download it to share.
* (More to come...)

## ⚙️ Getting Started

*(Project startup and local development instructions to be added)*

---

## Development Log

### Node 0: The Clean Slate - 2025-06-27

**Status:** A most basic, standard, single-language Next.js application.

**Description:**
After experiencing multiple failed attempts to integrate the `next-intl` internationalization library for the project, we decided to overturn all previous changes and perform a thorough "hard reset." We removed all code, configurations, file structures, and dependencies related to `next-intl`, restoring the project to a "100% stable, predictable zero base."

This node is the most important cornerstone of the project. It runs successfully and displays pages normally at `http://localhost:3000` without any errors. It marks the correctness of all our underlying configurations (Next.js, TypeScript, Tailwind CSS), providing an absolutely reliable starting point for the development of all subsequent features.

**Core Decisions:**
* **Rebuild from Scratch:** Clarified that when encountering complex, chaotic errors, a "hard reset" is a better solution than "patching."
* **Establishing Principles:** Based on this experience, we established three core collaboration principles: "node archiving," "clear communication," and "self-review."

---

### Milestone: Project Initialization - 2025-06-27

**Status:** A stable and reliable project skeleton initialized through official toolchains.

**Description:** 
Successfully cleared all historical legacy issues and built a stable, reliable Next.js (App Router), TypeScript, Tailwind CSS, and Shadcn UI project skeleton through official toolchains (`create-next-app`, `shadcn-ui init`). All dependencies have been installed, and the local development server (`npm run dev`) can successfully start and render the default welcome page without any errors. The project foundation is officially completed.

**Archive (Git Commit):** `50a7f1a`

### Milestone: Internationalization Implementation - 2025-06-27

**Status:** Successfully implemented bilingual switching between Chinese and English, and the website can be accessed through different language paths.

**Description:** 
Successfully configured and implemented internationalization based on `next-intl`. The website now supports Chinese (/zh) and English (/en) versions, which can be switched through URL path prefixes. Adopted a "browser settings-based automatic detection" strategy, while ensuring all URLs contain explicit language identifiers. Translation content is managed through JSON files, facilitating subsequent expansion and maintenance.

**Technical Requirements:**
- Used the `next-intl` library to implement internationalized routing and content translation
- Configured `middleware.ts` to handle language route redirects
- Implemented `i18n.ts` to configure language validation and message loading
- Integrated `NextIntlClientProvider` in `app/[locale]/layout.tsx`
- Managed translation content through JSON files in the `messages/` directory

**Archive (Git Commit):** `cc9fac6`

**Note:**
The current configuration contains some warnings about upcoming deprecation of `next-intl` APIs. These do not affect functionality but may need to be updated in future versions.

### Milestone: Daily Quote Feature Implementation - 2025-06-28

**Status:** Successfully implemented the website's core feature, "Daily Quote," and resolved internationalization configuration issues.

**Description:** 
Implemented the website's core feature—a random quote display system. Users can see a randomly selected quote on the homepage and get new quotes through the refresh button. Meanwhile, the website supports bilingual switching between Chinese and English, and users can switch languages through the top navigation bar. Resolved issues with client component and server component interaction as well as internationalization configuration issues, ensuring stable website operation.

**Technical Requirements:**
- Implemented quote database and random retrieval logic
- Created the QuoteCard component, supporting random refresh functionality
- Fixed client component and server component interaction issues
- Improved internationalization configuration, supporting Chinese-English switching
- Optimized page layout and basic styles

**Challenges and Solutions:**
- **Client Component Interaction Issue:** Due to the separation of Next.js server components and client components, functions in server components cannot be directly passed to client components. The solution was to directly import and use the getRandomQuote function in client components.
- **Internationalization Configuration Issue:** API changes in next-intl made the requestLocale function unavailable. Modified the i18n/request.ts file to directly use the passed locale parameter instead of calling the requestLocale function.

**Archive (Git Commit):** `[To be filled after submission]`

**Next Steps:**
Improve visual design, optimize user experience, expand the quote database, and start planning the AI Tree Hole feature.

### Milestone: AI Emotional Support Feature Implementation - 2025-06-28

**Status:** Successfully implemented the website's second core feature, "AI Emotional Tree Hole," supporting emotional communication with AI.

**Description:** 
Implemented the website's second core feature—the "AI Emotional Tree Hole" system. Users can enter the tree hole page through the homepage entrance and engage in emotional communication dialogue with the AI assistant. The system supports streaming responses, providing a natural and smooth conversation experience. At the same time, the tree hole feature also fully supports bilingual functionality in Chinese and English, seamlessly integrated with the website's overall internationalization.

**Technical Requirements:**
- Integrated ZhipuAI's GLM-4 model API to achieve high-quality emotional dialogue

### Milestone: Payment System Implementation - 2025-06-29

**Status:** Successfully implemented完整的 PayPal 支付系统，支持用户购买对话包和订阅服务。

**Description:** 
完成了 Soul Comfort 网站的支付系统集成，包括 PayPal 支付网关、用户积分管理、交易记录和支付结果处理。系统支持按次付费购买对话包，提供完整的支付流程和错误处理机制。

**Technical Requirements:**
- 集成 PayPal Checkout SDK 实现支付处理
- 创建用户积分和交易管理系统
- 实现支付成功/失败页面和错误处理
- 支持多语言支付界面
- 添加支付系统测试脚本和数据库结构

**Key Features:**
- PayPal 沙盒和生产环境支持
- 用户积分购买和管理
- 交易记录和状态跟踪
- 支付回调处理和 webhook 支持
- 完整的错误处理和用户反馈

**Files Added/Modified:**
- `lib/paypal-client.ts` - PayPal 客户端配置
- `app/api/payment/*` - 支付相关 API 端点
- `app/[locale]/payment-success/page.tsx` - 支付成功页面
- `app/[locale]/payment-error/page.tsx` - 支付错误页面
- `messages/en.json` & `messages/zh.json` - 支付相关翻译
- `database-schema.sql` - 数据库表结构
- `test-payment-system.js` - 支付系统测试脚本
- `env.example` - 环境变量配置示例

**Next Steps:**
1. 在 Supabase 中执行数据库表结构
2. 配置 PayPal 开发者账号
3. 设置环境变量
4. 测试完整支付流程
- Created complete chat interface components, including message display and input areas
- Implemented streaming response processing, providing real-time typing effects
- Optimized error handling and loading states
- Designed system prompts targeted for emotional support

**Challenges and Solutions:**
- **API Integration Issue:** Tried multiple AI service providers and eventually successfully integrated ZhipuAI's GLM-4 model.
- **Streaming Response Parsing:** Implemented custom parsing logic for ZhipuAI's specific response format to ensure correct display of streaming text.

**Archive (Git Commit):** `d876d52`

## 📋 Upcoming Features

The following features are planned for future iterations:

1. **Multiple Conversation Modes**
   - Implement "Listening," "Guidance," and "Challenge" as three different AI conversation modes
   - Add mode switching interface allowing users to choose different interaction styles based on their needs
   - Design dedicated system prompts for each mode to optimize conversation experience

2. **Mobile Experience Optimization**
   - Improve responsive layout to ensure optimal display on various screen sizes
   - Optimize touch interactions to enhance user experience on mobile devices
   - Handle layout adjustments when virtual keyboard pops up
   - Add common mobile interaction patterns like pull-to-refresh

3. **User Feedback Mechanism**
   - Add conversation rating functionality allowing users to evaluate AI replies
   - Implement detailed feedback forms to collect user suggestions for the system
   - Develop feedback data analysis tools to guide product improvement directions

4. **Quote Collection Feature**
   - Allow users to collect favorite quotes
   - Create a collection page for users to view and manage collected content
   - Add sharing functionality to support sharing quotes to social media

5. **Content Expansion**
   - Expand the quote database, adding more categories and content
   - Implement functionality to filter quotes by category
   - Add regular update mechanisms to keep content fresh

## 🌐 Website Deployment Plan and API Protection Measures

### 1. Website Deployment Steps

1. **Purchase Domain**
   - Choose a short, memorable domain related to the project theme
   - Recommended domain service providers: Namecheap, GoDaddy, Aliyun, etc.

2. **Choose Deployment Platform**
   - Vercel (Recommended): Best suited for Next.js projects, simple deployment
   - Netlify: Also supports Next.js, has good free plans
   - Railway: Suitable for applications requiring backend services
   - Aliyun/Tencent Cloud: Faster access speed in China

3. **Pre-deployment Preparation**
   - Create `.env.production` file, add production environment variables
   - Ensure API keys are securely stored, not directly committed to the code repository

4. **Deploy Using Vercel**
   - Create a Vercel account and connect GitHub repository
   - Configure environment variables (ZhipuAI API keys, etc.)
   - Click the deploy button, wait for automatic build and deployment
   - Bind custom domain

5. **Set Up Analytics Tools**
   - Add Google Analytics or Baidu Statistics to track user behavior
   - Set up simple error monitoring (such as Sentry)

### 2. API Protection Measures

1. **CAPTCHA System**
   - Verify identity before the user sends the first message to prevent API abuse
   - Recommended services: reCAPTCHA or hCaptcha
   - Implementation plan: `npm install react-google-recaptcha`

2. **Request Limitation System**
   - Daily request limits based on IP address (e.g., 10-20 messages per IP per day)
   - Use Redis or similar tools to record request counts
   - Prompt for payment or waiting for the next cycle when limits are exceeded

3. **Invitation Link System**
   - Generate unique invitation codes/links for early user testing
   - Invited users receive additional free usage quotas
   - Inviters can also receive rewards (such as additional usage times)

4. **Payment System Integration**
   - Use payment services like Stripe or PayPal
   - Design simple membership levels (basic/premium)
   - Premium members get higher daily limits and additional features

# Soul-Comfort Website

A multilingual website offering emotional support through daily inspirational quotes and AI-powered conversation.

## Features

### 1. Daily Quote
- Displays random inspirational quotes
- Supports quote refresh
- Multilingual support (English/Chinese)

### 2. AI Tree Hole
- AI-powered emotional support chatbot
- Uses ZhipuAI's GLM-4 model
- Four interaction modes:
  - **Listening Mode**: AI focuses on listening and understanding without judgment
  - **Comfort Mode**: AI provides empathy, validation, and gentle encouragement
  - **Mind Challenge Mode**: AI helps identify thought patterns and offers alternative perspectives
  - **Debate Training Mode**: AI engages in respectful debate to strengthen reasoning skills

## Deployment Plan

### Domain and Hosting
1. Purchase domain name
2. Select hosting platform (Vercel, AWS, etc.)
3. Set up SSL certificate

### Environment Setup
1. Configure environment variables
2. Set up database connections
3. Deploy application

### API Protection
1. Implement CAPTCHA system
2. Set request limits
3. Consider invitation system
4. Integrate payment system

## Safety Measures
- Emotion monitoring
- Session limits
- Content filtering
- Emergency resources

## Latest Progress (2025-06-29)

### Milestone: AI Emotional Tree Hole Multi-Mode Feature Implementation

**Status:** Successfully implemented multiple interaction modes for the AI Emotional Tree Hole, supporting bilingual functionality.

**Description:**
Building on the AI Tree Hole feature, added four different interaction modes allowing users to choose different AI response styles based on their needs:

1. **Listening Mode**: AI focuses on listening to users' thoughts without providing evaluations or suggestions, only offering emotional value and resonance
2. **Comfort Mode**: AI provides gentle support and suggestions, helping users feel secure
3. **Mind Challenge Mode**: AI helps users expand their thinking by offering beneficial questioning and new perspectives
4. **Debate Training Mode**: AI engages in beneficial debates with users, helping train thinking abilities and expression skills

**Technical Requirements:**
- Implemented a mode selector UI component supporting bilingual display in Chinese and English
- Designed dedicated system prompts for each mode to control AI response style
- Implemented mode switching functionality allowing mode changes during conversations
- Optimized visual feedback for mode selection, making users clear about their current mode choice
- Provided diversified responses for each mode to avoid repetition

**Challenges and Solutions:**
- **Internationalization Issue**: Achieved component-level internationalization by using useEffect to get the language code from the current URL path
- **Mode Switching Visual Feedback**: Added different styles for the currently selected mode button through conditional style classes
- **API Dependency Issue**: Created mock API responses providing diversified response templates for different modes and languages

**Next Steps:**
- Integrate real AI API to replace mock responses
- Optimize mobile experience
- Add user feedback mechanism
- Implement conversation history saving functionality

## Known Issues

### 1. Internationalization Text Display Issue

In the English interface, some UI elements (such as the "View Mode Description" button in the mode selector) still display in Chinese. This is because the `usePathname()` hook cannot correctly detect the current language path in some cases.

**Temporary Solution:**
- Use hardcoded English text in `components/ui/ModeSelector.tsx`
- Or use `window.location.href` to directly detect if the URL contains `/en/`

**To Be Resolved:**
- Find out why `usePathname()` doesn't work properly in Next.js internationalized routes
- Consider using Next.js provided internationalization context instead of manually detecting routes

### 2. JSON Parsing Error in ZhipuAI API Response Handling

When processing ZhipuAI's streaming responses, the following error occurs when receiving the `data: [DONE]` message:

```
JSON parsing error: SyntaxError: Unexpected non-whitespace character after JSON at position 237
```

**Current Handling:**
- Error catching logic has been added to the code to skip invalid JSON data
- This error does not affect the normal use of the chat function; it only displays error messages in the console

**To Be Improved:**
- Optimize streaming response processing logic to handle different types of response data more precisely
- Consider using the SDK example code provided by ZhipuAI to handle streaming responses

## Project Milestone: Usage Limitation System

### New Features Implemented

- **Client-side Unique ID**: Implemented a browser-based unique identifier system to track individual users without requiring login
- **Usage Tracking API**: Created API endpoints to track and limit the number of AI chat interactions
- **Usage Quota Display**: Added a visual indicator showing users their remaining free quota
- **Usage Limitation**: Implemented automatic disabling of the chat interface when the free usage limit is reached
- **Improved Error Handling**: Fixed JSON parsing errors in the streaming API response handling

### Technical Implementation

- Created a client ID generation system using browser localStorage
- Implemented `/api/usage` endpoints with GET (query usage) and POST (increment usage) methods
- Modified the chat interface to display usage metrics and disable inputs when limits are reached
- Enhanced API error handling with better JSON parsing for Zhipu AI streaming responses

### Next Steps

- Implement payment page with subscription and credit-based options
- Integrate Creem payment processing
- Develop membership levels with different usage quotas
- Create invitation code system for referrals
- Design analytics for tracking conversion rates

This milestone lays the foundation for the full monetization system while maintaining a smooth user experience.

## Payment System Implementation Plan

To build upon our usage limitation system, we'll implement a complete payment solution following this structured approach:

### Phase 1: Authentication & User System (Without Database)

1. **Lightweight Authentication**
   - Implement token-based authentication using browser storage
   - Create verification mechanisms for paid users without requiring full user accounts
   - Design a seamless upgrade path from anonymous users to authenticated users

2. **Usage Tracking Enhancement**
   - Improve the current usage tracking system to handle different user tiers
   - Implement persistent storage solution for long-term usage statistics
   - Create analytics dashboard for monitoring usage patterns

### Phase 2: Payment Page & Integration

1. **Payment Page Development**
   - Create a dedicated upgrade page with pricing options
   - Design subscription (monthly) and credit-based payment models
   - Implement responsive UI with clear value proposition

2. **Creem Payment Integration**
   - Set up secure API communication with Creem payment platform
   - Implement payment verification and receipt handling
   - Design fallback mechanisms for failed payments
   - Create sandbox testing environment for payment flow validation

### Phase 3: Enhanced User Features

1. **Invitation Code System**
   - Generate unique invitation codes for sharing
   - Implement referral tracking mechanism
   - Create reward system (30 free API calls for invitees, 50 for inviters)
   - Design UI for code sharing and tracking rewards

2. **User Dashboard**
   - Develop usage history visualization
   - Create subscription management interface
   - Implement payment history and receipts
   - Add profile management options

### Phase 4: Security & Optimization

1. **Security Enhancements**
   - Implement rate limiting and abuse prevention
   - Add fraud detection for payment transactions
   - Create secure token verification system
   - Implement IP-based restrictions as fallback

2. **Performance Optimization**
   - Optimize payment processing flow
   - Implement caching for usage statistics
   - Reduce latency in authentication checks
   - Streamline the upgrade conversion funnel

This phased approach allows for incremental development while continuously providing value to users. Each phase builds upon the previous one, creating a robust payment and user management system.

# Priority Issues to Address Post-Launch

## Critical User Experience & System Integrity Issues

### 1. Client Identification Persistence
- **Issue**: Current localStorage-based client ID mechanism is vulnerable to data loss when users clear browser cache or use private browsing
- **Impact**: Paid users may lose their premium status unexpectedly
- **Solution**: Implement a recovery code system or account-based authentication
- **Priority**: High (Address within first week after launch)

### 2. Payment & Usage Limit Integration
- **Issue**: Limited integration between payment processing and usage tracking systems
- **Impact**: Potential inconsistencies in enforcing usage limits for premium users
- **Solution**: Create a more robust state management system linking payment status to usage rights
- **Priority**: High (Address within first week after launch)

### 3. Chat Interface & Upgrade Prompts
- **Issue**: Upgrade prompts and usage limit notifications need better integration in chat flow
- **Impact**: Users may experience confusing or abrupt service interruptions when limits are reached
- **Solution**: Implement graceful limit warnings and contextual upgrade suggestions
- **Priority**: Medium-High (Address within two weeks of launch)

## Security & Scalability Considerations

### 4. Payment Processing Security
- **Issue**: Basic payment flow lacks additional security measures
- **Impact**: Potential vulnerability to request manipulation
- **Solution**: Add request signing, timestamps, and session validation
- **Priority**: High (Implement before significant payment volume)

### 5. Cross-Device User Experience
- **Issue**: User benefits are tied to specific devices/browsers
- **Impact**: Users cannot seamlessly continue premium experience across devices
- **Solution**: Transition to account-based system with secure login
- **Priority**: Medium (Plan implementation within first month)

### 6. Multilingual Support Completeness
- **Issue**: Some UI elements use hardcoded text instead of translation files
- **Impact**: Inconsistent language experience for non-English users
- **Solution**: Migrate all hardcoded text to translation system
- **Priority**: Low (Address during regular maintenance cycles)

### 7. Edge Case Handling
- **Issue**: Limited handling for payment interruptions and special scenarios
- **Impact**: Potential user confusion during payment failures or limit edge cases
- **Solution**: Develop comprehensive error recovery and edge case management
- **Priority**: Medium (Implement as usage patterns emerge)

---

These issues represent planned technical debt to enable faster initial launch. Implementation priorities are based on impact to user experience and system integrity.

## 2023-06-26 Milestone: Payment System and Usage Limit Implementation

We have successfully implemented a lightweight payment system and usage limit functionality for the Soul Comfort Site, marking an important step towards commercialization.

### Completed Features

#### 1. Usage Limit System
- ✅ Implemented localStorage-based client ID generation and storage
- ✅ Created usage tracking API (`/api/usage`)
- ✅ Added usage count display and automatic limitation functionality
- ✅ Implemented automatic upgrade prompt when usage limit is reached

#### 2. Payment System Infrastructure
- ✅ Created payment API endpoint (`/api/payment`)
- ✅ Designed monthly subscription ($9.99/month) and credit packages (100 credits/$4.99 and up)
- ✅ Implemented payment status storage and benefit allocation logic
- ✅ Added upgrade guidance in the user interface

#### 3. Architecture Optimization
- ✅ Used `lib/storage.ts` to solve API circular dependency issues
- ✅ Added TypeScript type definitions to improve code quality
- ✅ Optimized the upgrade prompt experience in the chat interface
- ✅ Implemented a lightweight but extensible data management solution

### Technical Implementation

Adopted a "lightweight transition approach" with the following key features:
- Used in-memory storage instead of a database to meet rapid launch requirements
- Client ID based on localStorage for tracking usage limits
- Payment status stored in server memory and client localStorage
- System architecture designed for future iteration and expansion

### User Experience Highlights
- Real-time display of usage count with automatic highlighting when approaching limits
- Automatic display of upgrade prompts and buttons when limits are reached
- Multilingual payment prompts (Chinese/English)
- Multiple payment packages to meet different needs

### Next Steps
Refer to the "Priority Issues to Address Post-Launch" section, prioritizing client ID persistence, payment security, and other issues.

## 2023-06-29 Milestone: Internationalization and Payment System Optimization

We have successfully improved the internationalization support and optimized the payment system for Soul Comfort Site, enhancing the multilingual user experience and payment flow.

### Completed Features

#### 1. Internationalization Improvements
- ✅ Fixed JSON syntax errors in Chinese translation file (messages/zh.json)
- ✅ Fully internationalized the upgrade page using the translation system
- ✅ Corrected hardcoded text in components to use translation functions
- ✅ Ensured consistent language switching across all site sections

#### 2. Payment System Optimization
- ✅ Fixed the ordering of hooks and imports in upgrade page component
- ✅ Replaced hardcoded alert messages with internationalized text
- ✅ Added proper error handling for payment processing
- ✅ Improved the navigation component to correctly handle language switching

#### 3. Code Quality Improvements
- ✅ Fixed missing imports in Navbar component
- ✅ Added proper TypeScript type definitions for component props
- ✅ Corrected variable definitions and initialization order
- ✅ Standardized the use of translation functions across components

### Technical Implementation
- Adopted a consistent pattern for internationalization across the application
- Corrected component implementation to follow React best practices
- Improved error handling and user feedback during payment operations
- Enhanced code maintainability through proper hook usage and imports

### User Experience Highlights
- Seamless language switching throughout the entire application
- Consistent user interface text in both Chinese and English
- Improved error messages and payment flow guidance
- More reliable navigation between different site sections

### Next Steps
- Consider implementing account-based authentication for better premium status persistence
- Add more detailed payment analytics and tracking
- Expand the internationalization to support more languages
- Enhance the payment success/failure notifications with more detailed information

## 2023-07-01 Milestone: TypeScript Type Improvements for Cloudflare Pages Deployment

We have successfully fixed TypeScript type errors in the Soul Comfort Site to allow for successful deployment on Cloudflare Pages.

### Completed Fixes

#### 1. Chat Interface Component Type Definition
- ✅ Added proper HTML element type reference for DOM references in ChatInterface.tsx
- ✅ Applied explicit type annotation `useRef<HTMLDivElement>(null)` for messagesEndRef
- ✅ Resolved "Property 'scrollIntoView' does not exist on type 'never'" error

### Technical Implementation
- Updated the useRef hook with explicit type annotation to ensure TypeScript correctly recognizes DOM methods
- This change allows the scrollIntoView method to be properly recognized and called on the referenced DOM element
- Improved type safety throughout the component by properly specifying element types

### Build and Deployment Benefits
- Successfully builds without TypeScript errors on Cloudflare Pages
- Prevents potential runtime errors that could occur when the scrollIntoView method is called
- Improves code quality and maintainability by leveraging TypeScript's type checking
- Enables deployment to Cloudflare's global CDN network for optimal performance

### Next Steps
- Continue improving type annotations throughout the codebase
- Address any remaining TypeScript warnings or errors in other components
- Consider implementing a pre-commit hook to catch type errors before they're committed
- Add comprehensive TypeScript interfaces for all data structures used in the application

# Soul Comfort Site

Soul Comfort is a multilingual psychological support website that provides various conversation modes to help users through different emotional states.

## Features

- 🌐 Multilingual support (English and Chinese)
- 💬 Different conversation modes:
  - Listening Mode: Focuses on listening without judgment
  - Comfort Mode: Offers gentle support and suggestions
  - Challenge Mode: Helps challenge thought patterns
  - Debate Mode: Engages in beneficial debate to strengthen reasoning
- 🔄 Usage tracking and quota system
- 💫 Modern, responsive UI with smooth animations

## Tech Stack

- Next.js 14 with App Router
- React and TypeScript
- Tailwind CSS for styling
- Shadcn UI component library
- next-intl for internationalization

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Deployment

The site is deployed on Vercel and accessible at:
- [soul-comfort-site.vercel.app](https://soul-comfort-site.vercel.app)

## Milestones

### 2025-07-01: Platform Migration & TypeScript Fixes

- ✅ Successfully migrated from Cloudflare Pages to Vercel
- ✅ Fixed all TypeScript type errors in components
- ✅ Resolved middleware conflicts with static export
- ✅ Added proper type definitions for all components
- ✅ Configured environment variables for API integration
- ✅ Setup custom domain (pending DNS configuration)

### 2025-06-29: Internationalization Fixes

- ✅ Fixed JSON syntax errors in translation files
- ✅ Updated components to properly use translation hooks
- ✅ Implemented proper language switching

## Future Plans

- Enhance user profile management
- Add additional conversation modes
- Implement social sharing features
- Create mobile application version