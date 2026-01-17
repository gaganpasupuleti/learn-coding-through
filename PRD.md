# Product Requirements Document: CodeQuest - Learn Coding Through Projects

A welcoming educational platform that teaches absolute beginners how to code by building real projects step-by-step, with zero jargon and maximum clarity.

**Experience Qualities**:
1. **Approachable** - Every element should feel inviting and non-intimidating, removing the fear often associated with learning to code
2. **Clear** - Information hierarchy must be crystal clear, with obvious next steps and progress indicators throughout the learning journey
3. **Empowering** - Each completed step should feel like an achievement, building confidence through immediate visual feedback

**Complexity Level**: Light Application (multiple features with basic state)
This is a multi-page educational platform with project cards, step-by-step navigation, live previews, and interactive learning flows. It requires state management for tracking progress through steps but doesn't need complex data persistence or user accounts.

## Essential Features

### Feature 1: Landing Page
- **Functionality**: Welcome screen that introduces the platform's purpose
- **Purpose**: Set expectations and provide clear entry points for new learners
- **Trigger**: User visits the site
- **Progression**: View hero section with title/description → Click "Start Learning" or "View Projects" → Navigate to Projects Page
- **Success criteria**: Clear value proposition visible, both CTAs functional and lead to projects page

### Feature 2: Projects Gallery
- **Functionality**: Display available projects as cards with descriptions
- **Purpose**: Let learners browse and choose projects that interest them
- **Trigger**: User clicks navigation to projects or CTA from landing
- **Progression**: View project cards → Read descriptions → Click "Start Project" → Navigate to Project Learning Page
- **Success criteria**: All projects displayed with clear descriptions, cards clickable and navigate correctly

### Feature 3: Step-by-Step Project Learning
- **Functionality**: Guide learners through 5 structured steps for each project
- **Purpose**: Break down complex concepts into digestible, sequential learning moments
- **Trigger**: User clicks "Start Project" on any project card
- **Progression**: View Step 1 (Problem Understanding) → Click "Next" → View Step 2 (Logic Breakdown) → Next → View Step 3 (Code Section) → Next → View Step 4 (Live Preview) → Next → View Step 5 (Try Yourself) → Complete or return to projects
- **Success criteria**: Steps display in order, navigation works (Next/Previous), progress indicator shows current step, code is syntax highlighted, previews are functional and live

### Feature 4: Live Project Previews
- **Functionality**: Interactive output windows that show the working project
- **Purpose**: Provide immediate visual feedback and demonstrate what the code creates
- **Trigger**: User reaches Step 4 in any project
- **Progression**: View preview container → See live digital clock updating every second OR interact with working calculator buttons → Understand cause and effect
- **Success criteria**: Digital clock displays current time and updates automatically, calculator performs operations correctly with button clicks

### Feature 5: Code Display & Explanation
- **Functionality**: Show project code with syntax highlighting and line-by-line explanations
- **Purpose**: Help learners connect concepts to actual code implementation
- **Trigger**: User reaches Step 3 in any project
- **Progression**: View code editor → Read inline comments → Understand key concepts → Proceed to preview
- **Success criteria**: Code is readable, properly formatted, syntax highlighted, and includes helpful comments

## Edge Case Handling
- **Empty State**: If projects array is empty, show "No projects available yet" message
- **Step Navigation Boundaries**: Disable "Previous" on first step, show "Complete" instead of "Next" on final step
- **Preview Errors**: If preview fails to load/render, show friendly "Preview unavailable" message
- **Mobile Navigation**: Collapse navigation to hamburger menu on small screens
- **Long Code Blocks**: Make code sections scrollable with fixed height to prevent page overflow

## Design Direction
The design should feel like a warm, encouraging teacher - patient, organized, and celebratory of small wins. The interface should remove all intimidation through soft colors, generous spacing, and playful but professional typography. Every interaction should feel like progress, with smooth transitions and clear visual feedback that says "you're doing great, keep going!"

## Color Selection
A calming, confidence-building palette that balances professionalism with approachability, using nature-inspired tones to reduce anxiety.

- **Primary Color**: Deep Teal (oklch(0.45 0.12 200)) - Represents trust, learning, and stability. Used for main CTAs and primary navigation to guide users confidently through the experience.
- **Secondary Colors**: 
  - Soft Lavender (oklch(0.75 0.08 290)) - For secondary actions and backgrounds, providing gentle contrast
  - Warm Sand (oklch(0.92 0.02 80)) - For cards and content containers, creating warmth without distraction
- **Accent Color**: Bright Coral (oklch(0.68 0.18 25)) - For success moments, highlights, and interactive elements that deserve attention. Creates energy and excitement for achievements.
- **Foreground/Background Pairings**:
  - Primary Teal (oklch(0.45 0.12 200)): White text (oklch(0.98 0 0)) - Ratio 7.2:1 ✓
  - Accent Coral (oklch(0.68 0.18 25)): White text (oklch(0.98 0 0)) - Ratio 4.9:1 ✓
  - Background Sand (oklch(0.92 0.02 80)): Dark Gray text (oklch(0.25 0.01 260)) - Ratio 11.8:1 ✓
  - Secondary Lavender (oklch(0.75 0.08 290)): Dark Gray text (oklch(0.25 0.01 260)) - Ratio 6.1:1 ✓

## Font Selection
Typography should feel modern and approachable while maintaining excellent readability for code snippets - a combination that welcomes learners while respecting the technical content.

**Primary Font**: Space Grotesk - A geometric sans-serif with friendly, open letterforms that feels modern and accessible without being overly casual. Perfect for headings and UI elements.
**Code Font**: JetBrains Mono - A monospace font specifically designed for developers, with excellent character distinction and ligature support for readable code.
**Body Font**: Inter - Clean, highly legible, and optimized for screens at all sizes. Neutral enough to not distract from learning content.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Space Grotesk Bold/36px/tight letter-spacing (-0.02em)
  - H2 (Section Titles): Space Grotesk SemiBold/28px/normal letter-spacing
  - H3 (Step Titles): Space Grotesk Medium/22px/normal letter-spacing
  - Body Text (Explanations): Inter Regular/16px/relaxed line-height (1.7)
  - Small Text (Hints): Inter Regular/14px/normal line-height (1.5)
  - Code Blocks: JetBrains Mono Regular/14px/normal line-height (1.6)

## Animations
Animations should guide attention and celebrate progress without creating delays. Use motion to reinforce the feeling of forward momentum in the learning journey - smooth page transitions (300ms ease-out), gentle card hover lifts with subtle shadows, and satisfying button presses. Step transitions should slide horizontally (400ms) to create spatial understanding. Success moments (completing steps) deserve a brief, joyful scale animation (200ms bounce).

## Component Selection

### Components
- **Card**: Project cards on gallery page with hover effects - add `hover:shadow-lg transition-shadow duration-300` and subtle `hover:-translate-y-1` transform
- **Button**: Primary CTAs use filled style, secondary use outline variant - customize with rounded corners matching `--radius`
- **Badge**: For step indicators (Step 1/5) with custom teal background
- **Separator**: Between step sections for visual breathing room
- **ScrollArea**: For code blocks to contain long snippets without breaking layout
- **Tabs**: For toggling between code/explanation views if needed
- **Progress**: Circular or linear progress for step completion tracking
- **Dialog**: For "Try Yourself" challenge hints or additional explanations (optional)

### Customizations
- **Project Card Component**: Custom component combining Card with image placeholder, title, description, and CTA button
- **Step Container Component**: Custom wrapper that handles step navigation, progress display, and content rendering
- **Code Editor Component**: Custom syntax-highlighted code display using ScrollArea with line numbers
- **Preview Frame Component**: Custom container for live project outputs (clock, calculator)

### States
- **Buttons**: 
  - Default: Solid background with primary color
  - Hover: Slightly lighter shade with subtle lift (translate-y)
  - Active: Pressed state with deeper color
  - Disabled: Muted with reduced opacity (0.5) and no cursor
- **Cards**: 
  - Default: Subtle border on sand background
  - Hover: Elevated shadow and slight upward translation
  - Active: Border color changes to accent coral
- **Step Navigation**:
  - Current step: Accent coral badge with higher contrast
  - Completed steps: Checkmark icon in primary teal
  - Upcoming steps: Muted gray with dashed outline

### Icon Selection
- **Home/Landing**: House (for nav)
- **Projects**: Cube or SquaresFour (representing building blocks)
- **Next/Previous**: CaretRight/CaretLeft (for step navigation)
- **Complete**: Check or CheckCircle (for completed steps)
- **Code**: Code or FileCode (for code sections)
- **Play/Preview**: Play or Eye (for live previews)
- **Lightbulb**: For "Try Yourself" challenges
- **ArrowRight**: For primary CTAs to indicate forward progress

### Spacing
- **Container Padding**: 6 (1.5rem) on mobile, 8 (2rem) on tablet+
- **Card Padding**: 6 (1.5rem) internally
- **Section Gaps**: 8 (2rem) between major sections, 4 (1rem) between related elements
- **Button Padding**: px-6 py-3 for primary, px-4 py-2 for secondary
- **Step Content**: Generous vertical rhythm with space-y-6 for paragraphs

### Mobile
- **Navigation**: Fixed bottom navigation bar on mobile with icons only, expanding to full nav bar on desktop
- **Project Cards**: Single column stack on mobile (<768px), 2 columns on tablet (768-1024px), 3 columns on desktop (1024px+)
- **Step Layout**: Full-width single column on mobile with collapsible code sections; side-by-side code/preview on desktop (60/40 split)
- **Typography Scale**: Reduce heading sizes by 20% on mobile (H1: 28px, H2: 22px, H3: 18px)
- **Touch Targets**: Minimum 44px height for all interactive elements on mobile
