const fs = require('fs/promises');
const path = require('path');
const { generateUUID, createScaleKeyframes } = require('./utils');
const { PROJECTS_DIR } = require('./paths');
const { VIGNETTE_EFFECT, OLD_COMEDY_EFFECT, TRANSITION_AFASTAR, TRANSITION_COMBINAR, FADE_IN_ANIM, FADE_OUT_ANIM } = require('./effects');

function addFadeAnimation(data, animDef, startOffset, duration) {
    const animId = generateUUID();
    data.materials = data.materials || {};
    data.materials.material_animations = data.materials.material_animations || [];
    
    data.materials.material_animations.append ? data.materials.material_animations.push : null; // just safety 
    data.materials.material_animations.push({
        id: animId, type: "sticker_animation",
        animations: [{
            id: animDef.id, type: animDef.type, start: startOffset, duration: duration,
            path: animDef.path, name: animDef.name, category_id: animDef.category_id,
            platform: "all", resource_id: animDef.id, third_resource_id: animDef.id,
            source_platform: 1, panel: "video", material_type: "video",
            anim_adjust_params: null, request_id: generateUUID()
        }],
        multi_language_current: "none"
    });
    return animId;
}

function addTransition(data, transitionDef, duration = 466666) {
    const transUuid = generateUUID();
    data.materials = data.materials || {};
    data.materials.transitions = data.materials.transitions || [];
    
    data.materials.transitions.push({
        id: transUuid, type: "transition", name: transitionDef.name,
        effect_id: transitionDef.effect_id, resource_id: transitionDef.effect_id,
        third_resource_id: transitionDef.effect_id, source_platform: 1,
        path: transitionDef.path, duration: duration, is_overlap: transitionDef.is_overlap,
        platform: "all", category_id: "25822", category_name: "Populares",
        is_ai_transition: false, video_path: "", task_id: ""
    });
    return transUuid;
}

function addEffectSegment(data, effectDef, startTime, durationUs) {
    const effMatId = generateUUID();
    data.materials = data.materials || {};
    data.materials.video_effects = data.materials.video_effects || [];
    
    data.materials.video_effects.push({
        id: effMatId, effect_id: effectDef.effect_id, resource_id: effectDef.effect_id,
        name: effectDef.name, type: "video_effect", sub_type: 0, bind_segment_id: "",
        transparent_params: "", path: effectDef.path, value: 1.0,
        category_id: "100000", category_name: "Efeitos de vídeo", platform: "all",
        apply_target_type: 2, source_platform: 1, item_effect_type: 0,
        adjust_params: effectDef.adjusts, time_range: null, enable_mask: true, effect_mask: [],
        enable_video_mask_stroke: true, enable_video_mask_shadow: true
    });
    
    return {
        id: generateUUID(), source_timerange: null,
        target_timerange: { start: startTime, duration: durationUs },
        render_timerange: { start: 0, duration: 0 },
        desc: "", state: 0, speed: 1.0, clip: null, uniform_scale: null,
        material_id: effMatId, extra_material_refs: [], render_index: 11000,
        keyframe_refs: [], enable_lut: false, enable_adjust: false, enable_hsl: false,
        visible: true, track_render_index: 0, source: "segmentsourcenormal",
        enable_color_curves: true, enable_hsl_curves: true, enable_color_wheels: true,
        track_attribute: 0, is_placeholder: false, template_id: "",
        enable_smart_color_adjust: false, template_scene: "default",
        common_keyframes: [], caption_info: null,
        responsive_layout: { enable: false, target_follow: "", size_layout: 0, horizontal_pos_layout: 0, vertical_pos_layout: 0 },
        enable_color_match_adjust: false, enable_color_correct_adjust: false,
        enable_adjust_mask: false, raw_segment_id: "", lyric_keyframes: null,
        enable_video_mask: true, digital_human_template_group_id: "",
        color_correct_alg_result: "", enable_mask_stroke: false, enable_mask_shadow: false,
        enable_color_adjust_pro: false, hdr_settings: null, group_id: ""
    };
}

function getBaseMaterial(data, materialId) {
    if(!data.materials || !data.materials.videos) return null;
    return data.materials.videos.find(m => m.id === materialId) || null;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function processTimelineData(data) {
    data.config = data.config || {};
    data.config.video_mute = true;

    const tracks = data.tracks || [];
    let mainVideoTrack = null;
    let audioTrack = null;
    
    for (const t of tracks) {
        let flag = t.flag !== undefined ? t.flag : 0;
        if (t.type === "video" && flag === 0 && !mainVideoTrack) {
            mainVideoTrack = t;
        }
        if (t.type === "audio" && !audioTrack) {
            audioTrack = t;
        }
    }

    if (!mainVideoTrack || !mainVideoTrack.segments) {
        throw new Error("Track de vídeo principal vazia ou não encontrada.");
    }

    let audioDurationUs = 0;
    if (audioTrack && audioTrack.segments) {
        for (const seg of audioTrack.segments) {
            const end = seg.target_timerange.start + seg.target_timerange.duration;
            if (end > audioDurationUs) audioDurationUs = end;
        }
    }
    
    if (audioDurationUs === 0) {
        audioDurationUs = 60000000;
    }

    const targetDur = audioDurationUs + 2500000;
    
    data.materials.material_animations = [];
    data.materials.transitions = [];
    data.materials.video_effects = [];
    
    let bgSegments = [];
    let fgSegments = [];
    let effectSegments = [];
    let currentTime = 0;
    let originalSegs = [...mainVideoTrack.segments];

    for (let i = 0; i < originalSegs.length; i++) {
        const seg = originalSegs[i];
        if (currentTime >= targetDur) break;

        let slot = getRandomInt(4000000, 7000000);
        let isLast = false;
        
        if (currentTime + slot >= targetDur) {
            slot = targetDur - currentTime;
            isLast = true;
        }

        const matId = seg.material_id;
        const baseMat = getBaseMaterial(data, matId);
        
        if (!baseMat) continue;

        const isVideo = baseMat.has_audio === true;

        // Monta background
        let segBg = Object.assign({}, seg);
        // Deep clone das referencias que vamos alterar
        segBg.target_timerange = { start: currentTime, duration: slot };
        segBg.volume = 0.0;
        segBg.last_nonzero_volume = 1.0;

        if (isVideo) {
            let srcDur = baseMat.duration || slot;
            let srcStart = srcDur > slot ? getRandomInt(0, Math.max(0, srcDur - slot)) : 0;
            segBg.source_timerange = { start: srcStart, duration: Math.min(srcDur, slot) };
            segBg.clip = { scale: { x: 1.0, y: 1.0 }, alpha: 1.0, rotation: 0.0, transform: { x: 0.0, y: 0.0 }, flip: { vertical: false, horizontal: false } };
        } else {
            segBg.source_timerange = { start: 0, duration: slot };
            segBg.clip = { scale: { x: 2.1, y: 2.1 }, alpha: 0.45, rotation: 0.0, transform: { x: 0.0, y: 0.0 }, flip: { vertical: false, horizontal: false } };
        }

        let bgExtraRefs = [];
        if (i === 0) {
            bgExtraRefs.push(addFadeAnimation(data, FADE_IN_ANIM, 0, 500000));
        }
        if (isLast) {
            bgExtraRefs.push(addFadeAnimation(data, FADE_OUT_ANIM, Math.max(0, slot - 500000), 500000));
        }
        if (!isLast && Math.random() > 0.5) {
            bgExtraRefs.push(addTransition(data, Math.random() > 0.5 ? TRANSITION_AFASTAR : TRANSITION_COMBINAR));
        }

        segBg.extra_material_refs = bgExtraRefs;
        segBg.common_keyframes = [];
        bgSegments.push(segBg);

        if (!isVideo) {
            let w = baseMat.width || 1920;
            let h = baseMat.height || 1080;
            let is16_9 = Math.abs((h ? w / h : 1.777) - 1.777) < 0.05;

            if (!is16_9) {
                let segFg = Object.assign({}, segBg, { clip: {} });
                segFg.id = generateUUID();
                segFg.extra_material_refs = [];
                
                let low = parseFloat(getRandomFloat(0.70, 0.80).toFixed(4));
                let high = parseFloat(getRandomFloat(0.81, 0.90).toFixed(4));
                let [s, e] = Math.random() > 0.5 ? [low, high] : [high, low];

                segFg.clip = { scale: { x: s, y: s }, alpha: 1.0, rotation: 0.0, transform: { x: 0.0, y: 0.0 }, flip: { vertical: false, horizontal: false } };
                segFg.common_keyframes = createScaleKeyframes(s, e, slot);
                fgSegments.push(segFg);

                if (Math.random() > 0.5) {
                    let chosen = Math.random() > 0.5 ? VIGNETTE_EFFECT : OLD_COMEDY_EFFECT;
                    effectSegments.push(addEffectSegment(data, chosen, currentTime, slot));
                }
            } else {
                let low = parseFloat(getRandomFloat(1.00, 1.07).toFixed(4));
                let high = parseFloat(getRandomFloat(1.08, 1.15).toFixed(4));
                let [s, e] = Math.random() > 0.5 ? [low, high] : [high, low];
                
                segBg.clip.scale = { x: s, y: s };
                segBg.clip.alpha = 1.0;
                segBg.common_keyframes = createScaleKeyframes(s, e, slot);

                if (Math.random() > 0.5) {
                    let chosen = Math.random() > 0.5 ? VIGNETTE_EFFECT : OLD_COMEDY_EFFECT;
                    effectSegments.push(addEffectSegment(data, chosen, currentTime, slot));
                }
            }
        } else {
            if (Math.random() > 0.5) {
                let chosen = Math.random() > 0.5 ? VIGNETTE_EFFECT : OLD_COMEDY_EFFECT;
                effectSegments.push(addEffectSegment(data, chosen, currentTime, slot));
            }
        }

        currentTime += slot;
    }

    let newTracks = [];
    newTracks.push({
        id: generateUUID(), type: "video", attribute: 0, flag: 0,
        name: "", is_default_name: true, segments: bgSegments
    });
    if (fgSegments.length > 0) {
        newTracks.push({
            id: generateUUID(), type: "video", attribute: 0, flag: 2,
            name: "", is_default_name: true, segments: fgSegments
        });
    }
    if (effectSegments.length > 0) {
        newTracks.push({
            id: generateUUID(), type: "effect", attribute: 0, flag: 0,
            name: "", is_default_name: true, segments: effectSegments
        });
    }
    if (audioTrack) {
        newTracks.push(audioTrack);
    }

    data.tracks = newTracks;
    data.duration = currentTime;
    data.update_time = Math.floor(Date.now() * 1000);
    
    return currentTime;
}

async function findTimelineJson(projectDir) {
    const timelinesDir = path.join(projectDir, 'Timelines');
    let dirStats = await fs.stat(timelinesDir).catch(() => null);
    
    if (!dirStats) {
        return path.join(projectDir, 'draft_info.json');
    }

    const layoutPath = path.join(projectDir, 'timeline_layout.json');
    let layoutStats = await fs.stat(layoutPath).catch(() => null);
    
    if (layoutStats) {
        const layoutRaw = await fs.readFile(layoutPath, 'utf-8');
        const layout = JSON.parse(layoutRaw);
        
        for (const dock of (layout.dockItems || [])) {
            for (const tid of (dock.timelineIds || [])) {
                let candidate = path.join(timelinesDir, tid, 'draft_info.json');
                let candStat = await fs.stat(candidate).catch(() => null);
                if (candStat) return candidate;
            }
        }
    }

    const entries = await fs.readdir(timelinesDir);
    for (const entry of entries) {
        let candidate = path.join(timelinesDir, entry, 'draft_info.json');
        let candStat = await fs.stat(candidate).catch(() => null);
        if (candStat) return candidate;
    }

    return null;
}

async function syncAllMeta(projectDir, projectName, durationUs) {
    const now = Math.floor(Date.now() * 1000);

    // 1. draft_meta_info.json (na raiz do projeto)
    const metaPath = path.join(projectDir, "draft_meta_info.json");
    let metaStat = await fs.stat(metaPath).catch(() => null);
    if (metaStat) {
        let metaRaw = await fs.readFile(metaPath, 'utf-8');
        let meta = JSON.parse(metaRaw);
        meta.tm_draft_modified = now;
        meta.tm_duration = durationUs;
        await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
    }

    // 2. root_meta_info.json (índice global do CapCut, na raiz local de projetos)
    const rootMetaPath = path.join(PROJECTS_DIR, "root_meta_info.json");
    let rootStat = await fs.stat(rootMetaPath).catch(() => null);
    if (rootStat) {
        let rootRaw = await fs.readFile(rootMetaPath, 'utf-8');
        let rootData = JSON.parse(rootRaw);
        for (let proj of (rootData.all_draft_store || [])) {
            if (proj.draft_name === projectName) {
                proj.tm_draft_modified = now;
                proj.tm_duration = durationUs;
                break; // found and updated
            }
        }
        await fs.writeFile(rootMetaPath, JSON.stringify(rootData, null, 2), 'utf-8');
    }
}

async function processProjects(projectPaths, event) {
    let total = projectPaths.length;
    let current = 0;

    for (const projPath of projectPaths) {
        current++;
        const pName = path.basename(projPath);
        event.sender.send('process-progress', { msg: `Processando ${current}/${total}: ${pName}` });

        try {
            const jsonPath = await findTimelineJson(projPath);
            if (!jsonPath) {
                throw new Error("Arquivo de timeline (draft_info.json) não encontrado.");
            }

            // Backup logico
            await fs.copyFile(jsonPath, jsonPath + '.bak');

            // Read json
            const rawData = await fs.readFile(jsonPath, 'utf-8');
            let data = JSON.parse(rawData);

            // Process
            const finalDur = processTimelineData(data);

            // Save
            await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), 'utf-8');

            // Metadata Sync
            await syncAllMeta(projPath, pName, finalDur);

        } catch (err) {
            console.error(`Erro ao editar ${pName}:`, err);
            event.sender.send('process-progress', { msg: `Erro em ${pName}: ${err.message}. Pulando...` });
        }
    }
}

module.exports = {
    processProjects
};
