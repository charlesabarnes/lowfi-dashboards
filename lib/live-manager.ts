interface Dashboard {
    name: string;
    url: string;
    description?: string;
}

interface LiveConfig {
    rotationInterval: number;
    autoRotate: boolean;
    transitionDuration: number;
    dashboardOrder: string[];
}

class LiveDashboardManager {
    private currentIndex: number = 0;
    private dashboards: Dashboard[] = [];
    private config: LiveConfig;
    private lastUpdate: Date = new Date();

    constructor() {
        this.config = {
            rotationInterval: 30000,
            autoRotate: true,
            transitionDuration: 500,
            dashboardOrder: []
        };

        this.initializeDashboards();
    }

    private initializeDashboards() {
        this.dashboards = [
            { name: 'Weather & Time', url: '/dashboard/weather-time', description: 'Weather info (top) and current time (bottom)' },
            { name: 'Sports Scores', url: '/dashboard/sports-scores', description: 'Live sports scores cycling through active games' },
            { name: 'Matrix Effect', url: '/dashboard/matrix-effect', description: 'Animated matrix-style digital rain effect' },
            { name: 'Stock Ticker', url: '/dashboard/stock-ticker', description: 'Scrolling stock prices with live updates and colors' },
            { name: 'Fish Tank', url: '/dashboard/fish-tank', description: 'Animated aquarium with swimming fish, bubbles, and plants at 75fps' },
            { name: 'Space Invaders', url: '/dashboard/space-invaders', description: 'Retro arcade game with animated aliens and starfield background' },
            { name: 'Pac-Man Maze', url: '/dashboard/pacman-maze', description: 'Animated Pac-Man eating dots through a randomly generated maze' },
            { name: 'Bouncing Balls', url: '/dashboard/bouncing-balls', description: 'Colorful physics simulation with bouncing balls and trails' },
            { name: 'Fire Effect', url: '/dashboard/fire-effect', description: 'Realistic fire animation using solid colors for LED display' },
            { name: 'Starfield', url: '/dashboard/starfield', description: '3D starfield effect with moving stars and hyperspace jumps' },
            { name: 'Rain Effect', url: '/dashboard/rain-effect', description: 'Animated falling raindrops with puddle ripples and lightning' },
            { name: 'Snow Globe', url: '/dashboard/snow-globe', description: 'Swirling snow particles in a winter scene with trees and house' },
            { name: 'Lava Lamp', url: '/dashboard/lava-lamp', description: 'Blob-like shapes rising and falling with heat effects' },
            { name: 'Lightning Storm', url: '/dashboard/lightning-storm', description: 'Dark clouds with occasional lightning flashes and rain' },
            { name: 'DNA Helix', url: '/dashboard/dna-helix', description: 'Rotating double helix with particle effects and base pairs' },
            { name: 'Breakout/Arkanoid', url: '/dashboard/breakout-arkanoid', description: 'Ball bouncing and breaking blocks with particle effects' },
            { name: 'Centipede', url: '/dashboard/centipede', description: 'Segmented creature moving through obstacles and mushrooms' },
            { name: 'Frogger', url: '/dashboard/frogger', description: 'Cars and logs moving across lanes with animated frogs' },
            { name: 'Tetris', url: '/dashboard/tetris', description: 'Falling blocks with line clearing and AI gameplay' },
            { name: 'Snake Game', url: '/dashboard/snake-game', description: 'Classic snake growing as it eats food with AI control' },
            { name: 'Growing Tree', url: '/dashboard/growing-tree', description: 'Branches slowly growing and leaves falling in seasons' },
            { name: 'Ant Colony', url: '/dashboard/ant-colony', description: 'Ants following pheromone trails between food and anthill' },
            { name: 'Wave Pool', url: '/dashboard/wave-pool', description: 'Water waves with floating objects and particle effects' },
            { name: 'Coral Reef', url: '/dashboard/coral-reef', description: 'Swaying coral and swimming tropical fish with bubbles' },
            { name: 'Fireflies', url: '/dashboard/fireflies', description: 'Glowing insects floating in darkness with nature sounds' },
            { name: 'Mandala Generator', url: '/dashboard/mandala-generator', description: 'Rotating geometric patterns with evolving sacred geometry' },
            { name: 'Particle Fountain', url: '/dashboard/particle-fountain', description: 'Particles spraying up and falling with physics simulation' },
            { name: 'Maze Runner', url: '/dashboard/maze-runner', description: 'Automatically solving mazes with pathfinding algorithms' },
            { name: 'Game of Life', url: '/dashboard/game-of-life', description: 'Cellular automaton with evolving patterns and generations' },
            { name: 'Plasma Effect', url: '/dashboard/plasma-effect', description: 'Smooth color waves using solid color transitions' },
            { name: 'Audio Visualizer', url: '/dashboard/audio-visualizer', description: 'Bars reacting to system audio with frequency analysis' },
            { name: 'Clock Tower', url: '/dashboard/clock-tower', description: 'Animated analog clock with moving parts and architecture' },
            { name: 'Binary Rain', url: '/dashboard/binary-rain', description: 'Falling 1s and 0s like Matrix code with scan lines' },
            { name: 'Scrolling Text', url: '/dashboard/scrolling-text', description: 'Customizable message banner with color effects' },
            { name: 'Weather Radar', url: '/dashboard/weather-radar', description: 'Animated weather patterns with radar sweep' },
            { name: 'Halloween Pumpkins', url: '/dashboard/halloween-pumpkins', description: 'Carved pumpkins with flickering candles and spooky atmosphere' },
            { name: 'Christmas Tree', url: '/dashboard/christmas-tree', description: 'Animated lights and falling snow with winter scene' },
            { name: 'Fireworks', url: '/dashboard/fireworks', description: 'Exploding colorful particles with realistic physics' },
            { name: 'Easter Eggs', url: '/dashboard/easter-eggs', description: 'Bouncing decorated eggs with spring flowers and bunny' },
            { name: 'Heart Beat', url: '/dashboard/heart-beat', description: 'Pulsing heart for Valentine\'s Day with ECG waveform' }
        ];
    }

    getCurrentDashboard(): Dashboard & { index: number } {
        return {
            ...this.dashboards[this.currentIndex],
            index: this.currentIndex
        };
    }

    setCurrentIndex(index: number): boolean {
        if (index >= 0 && index < this.dashboards.length) {
            this.currentIndex = index;
            this.lastUpdate = new Date();
            return true;
        }
        return false;
    }

    nextDashboard(): Dashboard & { index: number } {
        this.currentIndex = (this.currentIndex + 1) % this.dashboards.length;
        this.lastUpdate = new Date();
        return this.getCurrentDashboard();
    }

    previousDashboard(): Dashboard & { index: number } {
        this.currentIndex = (this.currentIndex - 1 + this.dashboards.length) % this.dashboards.length;
        this.lastUpdate = new Date();
        return this.getCurrentDashboard();
    }

    setDashboardByName(name: string): Dashboard & { index: number } | null {
        const index = this.dashboards.findIndex(d =>
            d.name.toLowerCase() === name.toLowerCase() ||
            d.url.toLowerCase().includes(name.toLowerCase())
        );

        if (index !== -1) {
            this.currentIndex = index;
            this.lastUpdate = new Date();
            return this.getCurrentDashboard();
        }
        return null;
    }

    getConfig(): LiveConfig & { dashboards: Dashboard[] } {
        const orderedDashboards = this.config.dashboardOrder.length > 0
            ? this.getOrderedDashboards()
            : this.dashboards;

        return {
            ...this.config,
            dashboards: orderedDashboards
        };
    }

    updateConfig(newConfig: Partial<LiveConfig>): LiveConfig {
        // Ensure proper type conversion for incoming config
        if (newConfig.rotationInterval !== undefined) {
            newConfig.rotationInterval = Number(newConfig.rotationInterval);
        }
        if (newConfig.transitionDuration !== undefined) {
            newConfig.transitionDuration = Number(newConfig.transitionDuration);
        }
        if (newConfig.autoRotate !== undefined) {
            newConfig.autoRotate = Boolean(newConfig.autoRotate);
        }
        if (newConfig.dashboardOrder !== undefined && typeof newConfig.dashboardOrder === 'string') {
            // Handle if dashboardOrder comes as a string
            newConfig.dashboardOrder = (newConfig.dashboardOrder as any).split(',').map((s: string) => s.trim()).filter((s: string) => s);
        }

        this.config = {
            ...this.config,
            ...newConfig
        };

        // If dashboard order changed, reset to first dashboard in new order
        if (newConfig.dashboardOrder && newConfig.dashboardOrder.length > 0) {
            const orderedDashboards = this.getOrderedDashboards();
            if (orderedDashboards.length > 0) {
                const firstDashboard = orderedDashboards[0];
                const index = this.dashboards.findIndex(d => d.name === firstDashboard.name);
                if (index !== -1) {
                    this.currentIndex = index;
                }
            }
        }

        return this.config;
    }

    private getOrderedDashboards(): Dashboard[] {
        const ordered: Dashboard[] = [];
        for (const name of this.config.dashboardOrder) {
            const dashboard = this.dashboards.find(d =>
                d.name === name || d.url.includes(name)
            );
            if (dashboard) {
                ordered.push(dashboard);
            }
        }
        return ordered.length > 0 ? ordered : this.dashboards;
    }

    getDashboards(): Dashboard[] {
        return this.config.dashboardOrder.length > 0
            ? this.getOrderedDashboards()
            : this.dashboards;
    }

    getLastUpdate(): Date {
        return this.lastUpdate;
    }

    getAllDashboards(): Dashboard[] {
        return this.dashboards;
    }

}

// Create singleton instance
const liveManager = new LiveDashboardManager();

export default liveManager;
export { Dashboard, LiveConfig };