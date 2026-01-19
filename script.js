document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // Add glass hover effect movement
    document.querySelectorAll('.glass-panel').forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            panel.style.setProperty('--x', `${x}px`);
            panel.style.setProperty('--y', `${y}px`);
        });
    });
    // Tab Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');

            // Trigger animations if data tab
            if (targetId === 'data') {
                setTimeout(() => {
                    document.querySelector('.bar.quality').style.width = '80%';
                    document.querySelector('.bar.quantity').style.width = '100%';
                }, 100);
            }
        });
    });

    // Radar Chart Implementation
    const canvas = document.getElementById('radarChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const labels = ['Reasoning', 'Efficiency', 'Context Len', 'Vision Detail', 'Edge Ready'];

        // Define data with visibility state
        const datasets = {
            intern: { label: 'InternVL 3.5', color: '#74b9ff', scores: [5, 4, 4, 4, 2], visible: true },
            smol: { label: 'SmolVLM', color: '#55efc4', scores: [3, 5, 3, 3, 5], visible: true },
            qwen: { label: 'Qwen3-VL', color: '#a29bfe', scores: [5, 3, 5, 4, 3], visible: true },
            ovis: { label: 'Ovis2.5', color: '#ff7675', scores: [4, 3, 3, 5, 3], visible: true },
            minicpm: { label: 'MiniCPM-V 2.6', color: '#fab1a0', scores: [4, 5, 3, 5, 5], visible: true },
            paligemma: { label: 'PaliGemma 2', color: '#fd79a8', scores: [4, 3, 3, 5, 4], visible: true }
        };

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 20;
        const radius = 150;

        // Draw Grid
        function drawGrid() {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.fillStyle = '#b2bec3';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';

            // 5 levels
            for (let i = 1; i <= 5; i++) {
                ctx.beginPath();
                const r = (radius / 5) * i;
                for (let j = 0; j < 5; j++) {
                    const angle = (Math.PI * 2 / 5) * j - Math.PI / 2;
                    const x = centerX + Math.cos(angle) * r;
                    const y = centerY + Math.sin(angle) * r;
                    j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            }

            // Axis lines & labels
            for (let j = 0; j < 5; j++) {
                const angle = (Math.PI * 2 / 5) * j - Math.PI / 2;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x, y);
                ctx.stroke();

                // Labels
                const lblX = centerX + Math.cos(angle) * (radius + 20);
                const lblY = centerY + Math.sin(angle) * (radius + 20);
                ctx.fillText(labels[j], lblX, lblY + 5);
            }
        }

        // Draw Shape
        function drawShape(modelData) {
            if (!modelData.visible) return;

            ctx.beginPath();
            ctx.strokeStyle = modelData.color;
            ctx.lineWidth = 2;
            ctx.fillStyle = modelData.color + '33'; // 20% opacity

            for (let j = 0; j < 5; j++) {
                const score = modelData.scores[j];
                const r = (radius / 5) * score;
                const angle = (Math.PI * 2 / 5) * j - Math.PI / 2;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }

        function renderChart() {
            drawGrid();
            Object.values(datasets).forEach(drawShape);
        }

        // Interactive Legend
        const legendItems = document.querySelectorAll('.radar-legend .legend-item');
        legendItems.forEach((item, index) => {
            // Map index to keys: 0->intern, 1->smol, 2->qwen, 3->ovis, 4->minicpm, 5->pali
            const keys = Object.keys(datasets);
            const key = keys[index];

            item.addEventListener('click', () => {
                datasets[key].visible = !datasets[key].visible;
                item.classList.toggle('inactive');
                renderChart();
            });
        });

        // Initial render with animation
        drawGrid(); // draw grid immediately
        setTimeout(() => {
            renderChart();
        }, 500);
    }

    // Efficiency Scatter Chart Implementation
    const scatterCanvas = document.getElementById('scatterChart');
    if (scatterCanvas) {
        const ctx = scatterCanvas.getContext('2d');
        const width = scatterCanvas.width;
        const height = scatterCanvas.height;
        const padding = 50;

        // Data: x = Params(B), y = MathVista Score
        const data = [
            { name: 'InternVL 3.5', x: 20, y: 65.5, color: '#74b9ff' }, // Approx size
            { name: 'SmolVLM', x: 2, y: 45.2, color: '#55efc4' },
            { name: 'Qwen3-VL', x: 7, y: 85.8, color: '#a29bfe' },
            { name: 'Ovis2.5', x: 9, y: 83.4, color: '#ff7675' },
            { name: 'MiniCPM-V 2.6', x: 8, y: 60.6, color: '#fab1a0' },
            { name: 'PaliGemma 2', x: 10, y: 56.4, color: '#fd79a8' }
        ];

        // Scales
        const maxX = 30; // Max params
        const maxY = 100; // Max score

        const xScale = (val) => padding + (val / maxX) * (width - 2 * padding);
        const yScale = (val) => height - padding - (val / maxY) * (height - 2 * padding);

        function drawScatter() {
            // Background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.fillRect(0, 0, width, height);

            // Axes
            ctx.beginPath();
            ctx.strokeStyle = '#b2bec3';
            ctx.lineWidth = 1;
            // Y Axis
            ctx.moveTo(padding, padding);
            ctx.lineTo(padding, height - padding);
            // X Axis
            ctx.moveTo(padding, height - padding);
            ctx.lineTo(width - padding, height - padding);
            ctx.stroke();

            // Labels
            ctx.fillStyle = '#dfe6e9';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Parameters (Billion)', width / 2, height - 10);

            ctx.save();
            ctx.translate(15, height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText('MathVista Score (%)', 0, 0);
            ctx.restore();

            // Points
            data.forEach(p => {
                const px = xScale(p.x);
                const py = yScale(p.y);

                // Draw point
                ctx.beginPath();
                ctx.fillStyle = p.color;
                ctx.arc(px, py, 8, 0, Math.PI * 2);
                ctx.fill();

                // Draw Label
                ctx.fillStyle = 'white';
                ctx.font = '11px Inter';
                ctx.fillText(p.name, px, py - 15);
            });
        }

        drawScatter();
    }
    // Benchmark Animation
    const benchSection = document.querySelector('.benchmark-section');
    if (benchSection) {
        const benchObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bars = document.querySelectorAll('.bench-bar');
                    bars.forEach(bar => {
                        // Use text content as the target width
                        const targetWidth = bar.textContent;
                        bar.style.width = targetWidth;
                    });
                    benchObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        benchObserver.observe(benchSection);
    }
});
