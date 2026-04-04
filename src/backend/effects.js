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
    is_overlap: false
};

const TRANSITION_COMBINAR = {
    name: "Combinar",
    effect_id: "6724845717472416269",
    get path() { return resolveEffectPath("6724845717472416269", "7b53f4c008c4c684fccf8c7d4d46cc92") },
    is_overlap: true
};

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

module.exports = {
    VIGNETTE_EFFECT,
    OLD_COMEDY_EFFECT,
    TRANSITION_AFASTAR,
    TRANSITION_COMBINAR,
    FADE_IN_ANIM,
    FADE_OUT_ANIM
};
