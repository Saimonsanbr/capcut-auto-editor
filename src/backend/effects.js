const path = require('path');
const fs = require('fs');
const { EFFECTS_CACHE_DIR } = require('./paths');
const { addLog } = require('./logger');

// Caminho para a pasta assets/effects
// Pega o root directory (pois estamos em src/backend)
const ASSETS_EFFECTS_DIR = path.join(__dirname, '..', '..', 'assets', 'effects');

function resolveEffectPath(effectId, fallbackSuffix) {
    const localAssetPath = path.join(ASSETS_EFFECTS_DIR, effectId, fallbackSuffix);
    const cachePath = path.join(EFFECTS_CACHE_DIR, effectId, fallbackSuffix);

    if (fs.existsSync(localAssetPath)) {
        addLog(`Efeito [${effectId}] localizado na pasta local (assets).`, 'success');
        return localAssetPath;
    } else {
        addLog(`Efeito [${effectId}] NÃO achado em assets. Buscando do fallback do Cache do CapCut.`, 'warn');
        return cachePath;
    }
}

const VIGNETTE_EFFECT = {
    name: "Vinheta",
    effect_id: "7399463239379209477",
    get path() { return resolveEffectPath("7399463239379209477", "ef7abad9671e2f3da7993b7673ece5fc") },
    adjusts: [{ name: "effects_adjust_texture", value: 1.0, default_value: 1.0 }]
};

const OLD_COMEDY_EFFECT = {
    name: "Comédia romântica antiga",
    effect_id: "7470069413597777213",
    get path() { return resolveEffectPath("7470069413597777213", "281d99ee1be572618881c6804be72948") },
    adjusts: [
        { name: "effects_adjust_color", value: 0.1, default_value: 0.5 },
        { name: "effects_adjust_intensity", value: 0.34, default_value: 0.5 }
    ]
};

const TRANSITION_AFASTAR = {
    name: "Afastar",
    effect_id: "6724226338418332167",
    get path() { return resolveEffectPath("6724226338418332167", "8d97f1c1a60d9393c97ff4e9da0669ae") },
    is_overlap: false,
    duration: 466666
};

const TRANSITION_COMBINAR = {
    name: "Combinar",
    effect_id: "6724845717472416269",
    get path() { return resolveEffectPath("6724845717472416269", "7b53f4c008c4c684fccf8c7d4d46cc92") },
    is_overlap: true,
    duration: 466666
};

// ---- Novas transições (adicionadas via projeto "transições") ----
// Cada uma mantém exatamente a duração usada no projeto.
const TRANSITION_PARA_DIREITA = {
    name: "Para a direita",
    effect_id: "6724227599616184836",
    get path() { return resolveEffectPath("6724227599616184836", "94ddc5b44c66c523dbf70622efb612d3") },
    is_overlap: false,
    duration: 466666
};

const TRANSITION_BLURS_VERTICAL = {
    name: "Blurs vertical II",
    effect_id: "7291574063514784257",
    get path() { return resolveEffectPath("7291574063514784257", "85e381982a94778e003f3acc9527d5cf") },
    is_overlap: true,
    duration: 400000
};

const TRANSITION_QUEIMADO = {
    name: "Queimado",
    effect_id: "7558416989056666933",
    get path() { return resolveEffectPath("7558416989056666933", "ff4b8b8fe8150931cb6b71e4933f0d61") },
    is_overlap: true,
    duration: 866666
};

const TRANSITION_MOVIMENTO_PASTEL = {
    name: "Movimento pastel",
    effect_id: "7550260993348177213",
    get path() { return resolveEffectPath("7550260993348177213", "51bc57c8bcd1b596ad9fb0f190f578b4") },
    is_overlap: true,
    duration: 600000
};

const TRANSITION_POOL = [
    TRANSITION_AFASTAR,
    TRANSITION_COMBINAR,
    TRANSITION_PARA_DIREITA,
    TRANSITION_BLURS_VERTICAL,
    TRANSITION_QUEIMADO,
    TRANSITION_MOVIMENTO_PASTEL
];

// Sorteia uma transição do pool respeitando os ids habilitados na config.
// enabledIds undefined/null = todas habilitadas. Retorna null se vazio.
function pickRandomTransition(enabledIds) {
    const pool = !enabledIds
        ? TRANSITION_POOL
        : TRANSITION_POOL.filter(t => enabledIds.includes(t.effect_id));
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

const FADE_IN_ANIM = {
    name: "Fade-in",
    id: "6798320778182922760",
    type: "in",
    get path() { return resolveEffectPath("6798320778182922760", "883ad04bd79b502aaa55b5d9b87175ea") },
    category_id: "2037708297"
};

const FADE_OUT_ANIM = {
    name: "Fade-out",
    id: "6798320902548230669",
    type: "out",
    get path() { return resolveEffectPath("6798320902548230669", "c6f05ce62355b537be762550040bfc08") },
    category_id: "2037708372"
};

// ---- Novos efeitos (adicionados via projeto "edição automatizada") ----
// Cada um foi testado no CapCut "por cima" (faixa de efeito) e "dentro"
// (ligado ao segmento). Os valores abaixo usam a menor medida como min e a
// maior como max — o app sorteia dentro do intervalo a cada aplicação.

const ESTATICO_EFFECT = {
    name: "Estático",
    effect_id: "7399471185815244037",
    get path() { return resolveEffectPath("7399471185815244037", "65a1fb1567456e46d888a85f3efaa9a3") },
    adjustRanges: [
        { name: "effects_adjust_noise", min: 0.09, max: 0.19, default_value: 1.0 },
        { name: "effects_adjust_texture", min: 0.03, max: 0.12, default_value: 1.0 }
    ]
};

const RUIDO_EFFECT = {
    name: "Ruído",
    effect_id: "7399470727122013446",
    get path() { return resolveEffectPath("7399470727122013446", "3e5fc04a3ddff85aadb6b52681f00bcd") },
    adjustRanges: [
        { name: "effects_adjust_noise", min: 0.04, max: 0.13, default_value: 0.5 }
    ]
};

const OLHO_DE_PEIXE_EFFECT = {
    name: "Olho de peixe",
    effect_id: "7399466881364544773",
    get path() { return resolveEffectPath("7399466881364544773", "d577e4744d29d971675ec9c71d94ca94") },
    adjustRanges: [
        { name: "effects_adjust_distortion", min: 0.03, max: 0.11, default_value: 0.77 }
    ]
};

const RADIAL_BLUR_EFFECT = {
    name: "Radial Blur 2",
    effect_id: "7395473457980493061",
    get path() { return resolveEffectPath("7395473457980493061", "46f6856d1b6c40a7d6b7c6da0ae24439") },
    adjustRanges: [
        { name: "effects_adjust_intensity", min: 0.12, max: 0.13, default_value: 0.6 },
        { name: "effects_adjust_size", min: 0.35, max: 0.35, default_value: 0.35 },
        { name: "effects_adjust_horizontal_shift", min: 0.5, max: 0.5, default_value: 0.5 },
        { name: "effects_adjust_vertical_shift", min: 0.5, max: 0.5, default_value: 0.5 },
        { name: "effects_adjust_luminance", min: 0.15, max: 0.15, default_value: 0.15 },
        { name: "effects_adjust_filter", min: 0.15, max: 0.15, default_value: 0.15 }
    ]
};

// Pool sorteado pelo editor (mesmo estilo de chamada dos efeitos antigos:
// aplicados "por cima", na faixa de efeitos, com ~50% de chance por slot).
const VIDEO_EFFECT_POOL = [
    VIGNETTE_EFFECT,
    OLD_COMEDY_EFFECT,
    ESTATICO_EFFECT,
    RUIDO_EFFECT,
    OLHO_DE_PEIXE_EFFECT,
    RADIAL_BLUR_EFFECT
];

// Gera os adjusts concretos: defs com adjustRanges sorteiam dentro de
// [min, max]; defs antigos com adjusts fixos são usados como estão.
function buildEffectAdjusts(def) {
    if (def.adjustRanges) {
        return def.adjustRanges.map(r => ({
            name: r.name,
            value: r.min === r.max ? r.min : parseFloat((Math.random() * (r.max - r.min) + r.min).toFixed(4)),
            default_value: r.default_value
        }));
    }
    return def.adjusts;
}

// Sorteia um efeito do pool respeitando os ids habilitados na config.
// enabledIds undefined/null = todos habilitados. Retorna null se vazio.
function pickRandomEffect(enabledIds) {
    const pool = !enabledIds
        ? VIDEO_EFFECT_POOL
        : VIDEO_EFFECT_POOL.filter(e => enabledIds.includes(e.effect_id));
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = {
    VIGNETTE_EFFECT,
    OLD_COMEDY_EFFECT,
    TRANSITION_AFASTAR,
    TRANSITION_COMBINAR,
    TRANSITION_PARA_DIREITA,
    TRANSITION_BLURS_VERTICAL,
    TRANSITION_QUEIMADO,
    TRANSITION_MOVIMENTO_PASTEL,
    TRANSITION_POOL,
    pickRandomTransition,
    FADE_IN_ANIM,
    FADE_OUT_ANIM,
    ESTATICO_EFFECT,
    RUIDO_EFFECT,
    OLHO_DE_PEIXE_EFFECT,
    RADIAL_BLUR_EFFECT,
    VIDEO_EFFECT_POOL,
    buildEffectAdjusts,
    pickRandomEffect
};
