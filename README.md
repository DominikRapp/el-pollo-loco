# El Pollo Loco 🐔🌵

A browser-based 2D jump-and-run **speedrun game** inspired by western vibes.
The player controls the hero to fight enemies, collect items, defeat bosses, and survive across **5 challenging levels** in the desert world.

## Features

-   Playable directly in the browser (HTML, CSS, JavaScript -- no
    external frameworks needed)
-   Classic platformer mechanics: movement, jumping, throwing bottles
-   Enemies with increasing difficulty
-   Sound effects and background music
-   Leaderboard system (Firebase backend)
-   Responsive design for different screen sizes

## Getting Started

### Prerequisites

You only need a modern web browser (Chrome, Firefox, Edge, Safari).  
No installation or build step required.

### Installation

1.  Clone the repository:

    ``` bash
    git clone https://github.com/your-username/el-pollo-loco.git
    ```

2.  Open the project folder:

    ``` bash
    cd el-pollo-loco
    ```

3.  Start a local web server:

        for example using VSCode Live Server

4.  Open in your browser:

        http://localhost:8000

## Controls 🎮

-   **Arrow Keys / WASD** -- Move and jump\
-   **Space** -- Throw bottle\
-   **M** -- Mute/unmute sound

## Project Structure

    el-pollo-loco/
    ├── index.html          # Main entry point
    ├── css/                # Stylesheets
    ├── js/                 # JavaScript classes & logic
    │   ├── app/            # Core application scripts
    │   ├── models-classes/ # Game objects
    │   └── ui/             # Helper scripts
    ├── audio/              # Music and sound effects
    ├── fonts/              # Fonts
    ├── img/                # Images
    └── legal/              # Terms, privacy, imprint pages

## Technologies Used

-   **HTML5 Canvas** for rendering
-   **CSS3** for styling
-   **Vanilla JavaScript (ES6)** for game logic
-   **Firebase Realtime Database** for leaderboard

------------------------------------------------------------------------

Made with ❤️ as a course project.
