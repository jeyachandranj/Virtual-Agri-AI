import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Only keep standing talking animations
const animationFiles = {
  "Asking Question": "/animations/Asking Question.fbx",
  "Having A Meeting": "/animations/Having A Meeting.fbx",
  "Idle": "/animations/Idle.fbx", // Keep Idle as fallback
};

// Preload animations
Object.values(animationFiles).forEach((url) => {
  useFBX.preload(url);
});

const talkingAnimations = ["Asking Question", "Having A Meeting"];

// Universal viseme mapping for Tamil language support
const universalVisemeMap = {
  0: "viseme_sil", // silence
  1: "viseme_PP", // bilabial (p, b, m) - common in Tamil
  2: "viseme_aa", // open vowel sounds (a, அ) - Tamil open vowel
  3: "viseme_O",  // rounded vowels (o, ஒ) - Tamil rounded vowel
  4: "viseme_E",  // mid-front vowels (e, எ) - Tamil front vowel
  5: "viseme_I",  // high-front vowels (i, இ) - Tamil high vowel
  6: "viseme_U",  // high-back vowels (u, உ) - Tamil back vowel
  7: "viseme_kk", // velar consonants (k, g, க) - Tamil velar sounds
  8: "viseme_CH", // affricates (ch, ச) - Tamil affricates
  9: "viseme_DD", // dental/alveolar stops (d, t, த) - Tamil dental sounds
  10: "viseme_nn", // nasal sounds (n, ன, ண) - Tamil nasals
  11: "viseme_SS", // sibilants (s, sh, ஷ) - Tamil sibilants
  12: "viseme_TH", // dental fricatives (th, த+h) - Tamil aspirated sounds
  13: "viseme_FF", // labiodental fricatives (f, v, ஃப) - Tamil labiodentals
  14: "viseme_RR", // r-colored vowels (r, ர) - Tamil rhotic sounds
};

export function Avatar(props) {
  // Configuration settings
  const settings = {
    playAudio: true,
    headFollow: true,
    smoothMorphTarget: true,
    morphTargetSmoothing: 0.5
  };

  // Audio setup with proper error handling
  const audio = useMemo(() => {
    console.log("Received response: ", props.response.response);
 
    let audioPath = props.response.speechData.audioFilePath;
    console.log("Audio path:", audioPath);
    
    if (!audioPath) {
      audioPath = "";
    }
    
    return new Audio(audioPath);
  }, [props.response]);

  // Lipsync data with proper error handling
  const lipsync = useMemo(() => {
    // Check if props.response and props.response.speechData exist
    if (props.response && props.response.speechData && props.response.speechData.visemes) {
      return props.response.speechData.visemes;
    } else {
      console.warn("No viseme data found, creating empty lipsync");
      return [];
    }
  }, [props.response]);

  // Load the new model
  const { nodes, materials } = useGLTF('/models/67cc08be6f218c594a54ffed.glb');
  const { animations: idleAnimation } = useFBX("/animations/Idle.fbx");
  
  const [animation, setAnimation] = useState("Idle");
  idleAnimation[0].name = "Idle";
  
  const group = useRef();

  // Load animations
  let animationFilesArray = Object.values(animationFiles);
  let customAnimations = [];
  for (let i = 0; i < animationFilesArray.length; i++) {
    let { animations } = useFBX(animationFilesArray[i]);
    animations[0].name = Object.keys(animationFiles)[i];
    customAnimations.push(animations[0]);
  }
  const { actions } = useAnimations([idleAnimation[0], ...customAnimations], group);

  // Handle per-frame viseme updates
  useFrame(() => {
    // Check if audio exists and is playing
    if (!audio || audio.paused || audio.ended) {
      setAnimation("Idle");
      return;
    }
    
    // Check if we have the necessary nodes and properties
    if (!nodes || !nodes.Wolf3D_Avatar || !nodes.Wolf3D_Avatar.morphTargetDictionary) {
      console.warn("Morph target dictionary not found on Wolf3D_Avatar");
      return;
    }

    let currentAudioTime = audio.currentTime;

    // First reset all visemes to 0
    Object.values(universalVisemeMap).forEach((viseme) => {
      if (nodes.Wolf3D_Avatar.morphTargetDictionary[viseme] !== undefined) {
        if (!settings.smoothMorphTarget) {
          nodes.Wolf3D_Avatar.morphTargetInfluences[nodes.Wolf3D_Avatar.morphTargetDictionary[viseme]] = 0;
        } else {
          nodes.Wolf3D_Avatar.morphTargetInfluences[nodes.Wolf3D_Avatar.morphTargetDictionary[viseme]] = 
            THREE.MathUtils.lerp(
              nodes.Wolf3D_Avatar.morphTargetInfluences[nodes.Wolf3D_Avatar.morphTargetDictionary[viseme]],
              0,
              settings.morphTargetSmoothing
            );
        }
      }
    });

    // Check if lipsync data exists before using it
    if (lipsync && lipsync.length > 0) {
      // Apply current viseme
      for (let i = 0; i < lipsync.length; i++) {
        let visemeId = lipsync[i].visemeId;
        let visemeOffsetTime = lipsync[i].audioOffset / 1000;
        let nextVisemeOffsetTime = lipsync[i + 1] ? lipsync[i + 1].audioOffset / 1000 : visemeOffsetTime + 0.1;

        if (currentAudioTime >= visemeOffsetTime && currentAudioTime < nextVisemeOffsetTime) {
          const viseme = universalVisemeMap[visemeId] || universalVisemeMap[0];
          
          if (nodes.Wolf3D_Avatar.morphTargetDictionary[viseme] !== undefined) {
            if (!settings.smoothMorphTarget) {
              nodes.Wolf3D_Avatar.morphTargetInfluences[nodes.Wolf3D_Avatar.morphTargetDictionary[viseme]] = 1;
            } else {
              nodes.Wolf3D_Avatar.morphTargetInfluences[nodes.Wolf3D_Avatar.morphTargetDictionary[viseme]] = 
                THREE.MathUtils.lerp(
                  nodes.Wolf3D_Avatar.morphTargetInfluences[nodes.Wolf3D_Avatar.morphTargetDictionary[viseme]],
                  1,
                  settings.morphTargetSmoothing
                );
            }
          }

          // Occasional blinking
          if (Math.random() < 0.05 && nodes.Wolf3D_Avatar.morphTargetDictionary["blink"] !== undefined) {
            nodes.Wolf3D_Avatar.morphTargetInfluences[nodes.Wolf3D_Avatar.morphTargetDictionary["blink"]] = 1;
          }
          break;
        }
      }
    }
  });

  // Set up animation and audio
  useEffect(() => {
    // Check if nodes exists before accessing properties
    if (!nodes || !nodes.Wolf3D_Avatar || !nodes.Wolf3D_Avatar.morphTargetDictionary) {
      console.warn("Wolf3D_Avatar not available yet");
      return;
    }

    const handleAudioEnd = () => {
      const currentTime = Date.now(); 
      localStorage.setItem('questionStartTime', currentTime); 
      console.log('Audio finished at time:', currentTime);
    };

    // Set default viseme
    if (nodes.Wolf3D_Avatar.morphTargetDictionary["viseme_sil"] !== undefined) {
      nodes.Wolf3D_Avatar.morphTargetInfluences[nodes.Wolf3D_Avatar.morphTargetDictionary["viseme_sil"]] = 1;
    }

    // Cleanup any previous audio event listeners
    audio.removeEventListener('ended', handleAudioEnd);

    if (settings.playAudio) {
      // Reset the audio before playing to ensure consistent behavior
      audio.currentTime = 0;
      
      // Play audio with error handling
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Audio play failed:", error);
          setAnimation("Idle");
        });
      }
      
      // Always use one of the talking animations when audio is playing
      setAnimation(talkingAnimations[Math.floor(Math.random() * talkingAnimations.length)]);
      audio.addEventListener('ended', handleAudioEnd);
      
      return () => {
        audio.removeEventListener('ended', handleAudioEnd);
        audio.pause();
      };
    } else {
      setAnimation("Idle");
      audio.pause();
    }
  }, [props.response, audio, nodes]);

  // Apply animation with error handling
  useEffect(() => {
    // Check if actions and the specific animation exist
    if (actions && actions[animation]) {
      actions[animation].reset().fadeIn(0.5).play();
      return () => {
        // Check if the action still exists before calling fadeOut
        if (actions[animation]) {
          actions[animation].fadeOut(0.5);
        }
      };
    } else {
      console.warn(`Animation "${animation}" not found or actions not loaded yet.`);
    }
  }, [animation, actions]);

  // Head following camera
  useFrame((state) => {
    if (settings.headFollow && group.current) {
      const head = group.current.getObjectByName("Head");
      if (head) {
        head.lookAt(state.camera.position);
      }
    }
  });

  return (
    <group {...props} dispose={null} ref={group}>
      {nodes && nodes.Hips && <primitive object={nodes.Hips} />}
      {nodes && nodes.Wolf3D_Avatar && (
        <skinnedMesh
          name="Wolf3D_Avatar"
          geometry={nodes.Wolf3D_Avatar.geometry}
          material={materials.Wolf3D_Avatar}
          skeleton={nodes.Wolf3D_Avatar.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Avatar.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Avatar.morphTargetInfluences}
        />
      )}
      {nodes && nodes.Wolf3D_Avatar_Transparent && (
        <skinnedMesh
          geometry={nodes.Wolf3D_Avatar_Transparent.geometry}
          material={materials.Wolf3D_Avatar_Transparent}
          skeleton={nodes.Wolf3D_Avatar_Transparent.skeleton}
        />
      )}
    </group>
  );
}

useGLTF.preload('/models/67cc08be6f218c594a54ffed.glb');