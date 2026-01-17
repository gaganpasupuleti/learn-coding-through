# Product Requirements Document: CodeQuest - Learn Coding Through Projects

**Experience Qualities**:

**Experience Qualities**:
This is a multi-page educational platform with project cards, step-by-step navigation, live previews, and interactive learning flows. I
## Essential Features
### Feature 1: Landing Page

- **Progression**: View hero section with title/description → Click "Start L


## Essential Features

### Feature 1: Landing Page
- **Purpose**: Break down complex concepts into digestible, sequential lea
- **Progression**: View Step 1 (Problem Understanding) → Click "Next" → View St

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

Typography should feel modern and approachable while maintaining excellent readability
**Primary Font**: Space Grotesk - A geometric san
**Body Font**: Inter - Clean, highly legible, and optimized for screens at all sizes. Neutral enough to not distract from learning content.
- **Typographic Hierarchy**:

  - Body Text (Explanations): Inter Regul
  - Code Blocks: JetBrains Mono Regular/14px/normal line-height (1.6)
## Animations


- **Card**: Project cards on gallery page with hover effects - add `hover:shadow-lg transition-shadow duration-

- **ScrollArea**: For
- **Progress**: Circular or linear progress for step completion tracking

- **Project Card Component**: Custom component combining Card with image placeholder, title, descr
- **Code Editor Component**: Custom interactive code editor with editable texta


  - Hover: Slightly
  - Disabled: Muted with reduced opacity (0.5) and no cursor

  - Active: Border
  - Current step: Accent coral badge with higher contrast

### Icon Selection
- **Projects**: Cube or 
- **Complete**: Check or CheckCircle (for completed steps)
- **Play/Preview**: Play or Eye (for live previews)
- **ArrowRight**: For primary CTAs to indicate forward progress
### Spacing
- **Card Padding**: 6 (1.5rem) internally
- **Button Padding**: px-6 py-3 for primary, px-4 py-2 for secondary

- **Navigation**: Fixed bottom navigation bar on mobile with icons only, expanding to full nav bar o

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

