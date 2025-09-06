document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const labels = document.querySelectorAll('.label');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const fileInput = document.getElementById('fileInput');
    const configOutput = document.getElementById('configOutput');
    const messageArea = document.getElementById('messageArea');
    const showShadowToggle = document.getElementById('showShadowToggle');

    let isDragging = false;
    let currentLabel = null;
    let offsetX, offsetY;

    const gridWidth = 640;
    const gridHeight = 360;
    const requiredFileName = "_global_variables.json";

    const defaultPositions = {
        "x": [1, 0],
        "y": [1, 9],
        "z": [1, 18],
        "pitch": [1, 27],
        "yaw": [310, 180],
        "ja": [270, 189],
        "ha": [269, 198],
        "secondTurn": [248, 207],
        "preturn": [248, 216],
        "lastTurning": [1, 36],
        "landx": [1, 150],
        "landy": [1, 159],
        "landz": [1, 168],
        "hitx": [1, 177],
        "hity": [1, 186],
        "hitz": [1, 195],
        "jumpx": [1, 204],
        "jumpz": [1, 222],
        "speedx": [1, 231],
        "speedy": [1, 240],
        "speedz": [1, 249],
        "speedVector": [1, 258],
        "tier": [1, 267],
        "airtime": [1, 276],
        "grind": [1, 284],
        "mmx": [1, 293],
        "mmz": [1, 302],
        "offset": [1, 45],
        "offsetx": [1, 54],
        "offsetz": [1, 63],
        "pb": [1, 72],
        "pbx": [1, 81],
        "pbz": [1, 90],
        "lastInput": [1, 99],
        "lastSidestep": [1, 108],
        "lastTiming": [1, 117],
        "time": [1, 126]
    };
    
    const placeLabels = (positions) => {
        const containerRect = container.getBoundingClientRect();
        const scaleX = containerRect.width / gridWidth;
        const scaleY = containerRect.height / gridHeight;
        
        labels.forEach(label => {
            let labelId = label.id;
            let key = `$${labelId}_offset`;
            if (labelId === 'yaw') key = '$facing_offset';

            const pos = positions[key];
            const [x, y] = pos ? pos : defaultPositions[labelId];
            
            label.style.left = `${x * scaleX}px`;
            label.style.top = `${y * scaleY}px`;
        });
        
        if (positions['$showShadow'] !== undefined) {
            showShadowToggle.checked = positions['$showShadow'];
        }
    };
    
    placeLabels(defaultPositions);
    window.addEventListener('resize', () => placeLabels(defaultPositions));

    importBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        messageArea.textContent = "";

        if (file.name !== requiredFileName) {
            messageArea.textContent = `エラー: ファイル名は "${requiredFileName}" である必要があります。`;
            messageArea.style.color = "#ff3333";
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedPositions = JSON.parse(event.target.result);
                placeLabels(importedPositions);
                messageArea.textContent = "インポートが完了しました！";
                messageArea.style.color = "#33ff33";
            } catch (error) {
                messageArea.textContent = "エラー: 無効なJSONファイルです。";
                messageArea.style.color = "#ff3333";
            }
        };
        reader.readAsText(file);
    });

    labels.forEach(label => {
        label.addEventListener('mousedown', (e) => {
            isDragging = true;
            currentLabel = label;
            offsetX = e.clientX - label.getBoundingClientRect().left;
            offsetY = e.clientY - label.getBoundingClientRect().top;
            currentLabel.style.zIndex = 100;
        });
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const containerRect = container.getBoundingClientRect();
        let x = e.clientX - containerRect.left - offsetX;
        let y = e.clientY - containerRect.top - offsetY;

        const scaleX = containerRect.width / gridWidth;
        const scaleY = containerRect.height / gridHeight;
        
        let gridX = Math.round(x / scaleX);
        let gridY = Math.round(y / scaleY);

        gridX = Math.max(0, Math.min(gridX, gridWidth - 1));
        gridY = Math.max(0, Math.min(gridY, gridHeight - 1));
        
        currentLabel.style.left = `${gridX * scaleX}px`;
        currentLabel.style.top = `${gridY * scaleY}px`;
    });

    container.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            currentLabel.style.zIndex = 'auto';
            currentLabel = null;
        }
    });

    exportBtn.addEventListener('click', () => {
        const config = {};
        const containerRect = container.getBoundingClientRect();
        const scaleX = containerRect.width / gridWidth;
        const scaleY = containerRect.height / gridHeight;

        labels.forEach(label => {
            const x = Math.round(label.offsetLeft / scaleX);
            const y = Math.round(label.offsetTop / scaleY);
            
            let key = `$${label.id}_offset`;
            if (label.id === 'yaw') key = '$facing_offset';
            
            config[key] = [x, y];
        });

        config['$showShadow'] = showShadowToggle.checked;

        const jsonString = JSON.stringify(config, null, 2);

        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = requiredFileName;
        document.body.appendChild(a); // DOMに追加
        a.click();
        document.body.removeChild(a); // DOMから削除
        URL.revokeObjectURL(url);
    });
});