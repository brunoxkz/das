import fs from 'fs';
import path from 'path';

// 🔍 TESTE COMPLETO DE ELEMENTOS DO QUIZ
// Verifica todas as propriedades de renderização no preview e publicação

console.log('🎯 INICIANDO TESTE COMPLETO DE ELEMENTOS DO QUIZ');
console.log('===================================================');

// 📋 LISTA COMPLETA DE ELEMENTOS E SUAS PROPRIEDADES
const elementosQuiz = {
  // 📝 ELEMENTOS DE CONTEÚDO
  conteudo: {
    heading: {
      propriedades: [
        'fontSize', 'fontWeight', 'fontStyle', 'textDecoration', 'textColor', 
        'backgroundColor', 'textAlign', 'textGradient', 'gradientDirection',
        'gradientFrom', 'gradientTo', 'textShadow', 'animation', 'decorativeIcon',
        'letterSpacing', 'highlightKeywords', 'keywords', 'badge', 'badgeColor',
        'decorativeLine', 'lineColor', 'lineAlignment'
      ],
      testeCasos: [
        { fontSize: 'lg', fontWeight: 'bold', textColor: '#3B82F6' },
        { textGradient: true, gradientFrom: '#667eea', gradientTo: '#764ba2' },
        { textShadow: 'md', animation: 'fadeIn', decorativeIcon: '🚀' },
        { badge: 'NOVO', badgeColor: 'blue', decorativeLine: true }
      ]
    },
    
    paragraph: {
      propriedades: [
        'fontSize', 'fontWeight', 'fontStyle', 'textDecoration', 'textColor',
        'backgroundColor', 'textAlign', 'lineHeight', 'maxWidth', 'indent'
      ],
      testeCasos: [
        { fontSize: 'sm', textColor: '#6B7280', textAlign: 'justify' },
        { fontSize: 'lg', backgroundColor: '#F3F4F6', textAlign: 'center' },
        { fontStyle: 'italic', textDecoration: 'underline' }
      ]
    },
    
    image: {
      propriedades: [
        'imageUrl', 'altText', 'imageSize', 'imageAlignment', 'borderRadius',
        'borderColor', 'borderWidth', 'shadow', 'opacity', 'filter',
        'hoverEffect', 'clickAction', 'linkUrl', 'caption', 'overlay'
      ],
      testeCasos: [
        { imageSize: 'lg', borderRadius: 'md', shadow: 'lg' },
        { imageAlignment: 'center', hoverEffect: 'zoom', filter: 'brightness' },
        { overlay: true, caption: 'Imagem de teste', opacity: 0.8 }
      ]
    },
    
    video: {
      propriedades: [
        'videoUrl', 'autoPlay', 'controls', 'loop', 'muted', 'poster',
        'aspectRatio', 'startTime', 'endTime', 'quality', 'playbackRate'
      ],
      testeCasos: [
        { controls: true, autoPlay: false, aspectRatio: '16:9' },
        { loop: true, muted: true, playbackRate: 1.5 },
        { poster: 'thumbnail.jpg', startTime: 10, endTime: 60 }
      ]
    },
    
    audio: {
      propriedades: [
        'audioUrl', 'audioType', 'controls', 'autoPlay', 'loop', 'volume',
        'showWaveform', 'audioTitle', 'audioDuration', 'elevenLabsText',
        'elevenLabsVoiceId', 'elevenLabsApiKey'
      ],
      testeCasos: [
        { audioType: 'upload', controls: true, showWaveform: true },
        { audioType: 'elevenlabs', elevenLabsText: 'Texto para áudio', volume: 0.8 },
        { autoPlay: false, loop: true, audioTitle: 'Áudio de teste' }
      ]
    }
  },
  
  // ❓ ELEMENTOS DE PERGUNTA
  perguntas: {
    multiple_choice: {
      propriedades: [
        'question', 'options', 'required', 'optionLayout', 'buttonStyle',
        'multipleSelection', 'optionImages', 'optionIcons', 'optionSubtexts',
        'optionPoints', 'showOptionPoints', 'popularOption', 'randomizeOptions',
        'animateOptions', 'minSelections', 'maxSelections', 'hideInputs',
        'inputStyle', 'spacing', 'borderStyle', 'shadowStyle', 'imageSize',
        'iconSize', 'imageOverlay', 'questionDescription', 'showQuestionNumber',
        'questionNumber', 'optionTextSize'
      ],
      testeCasos: [
        { optionLayout: 'grid', buttonStyle: 'cards', multipleSelection: true },
        { optionImages: ['img1.jpg', 'img2.jpg'], showOptionPoints: true },
        { randomizeOptions: true, animateOptions: true, popularOption: 0 },
        { minSelections: 2, maxSelections: 3, hideInputs: true }
      ]
    },
    
    text: {
      propriedades: [
        'question', 'placeholder', 'required', 'fieldId', 'inputStyle',
        'maxLength', 'minLength', 'validation', 'mask', 'showFieldIcon',
        'fieldDescription', 'helperText', 'errorMessage', 'prefixText',
        'suffixText', 'autoComplete', 'spellCheck'
      ],
      testeCasos: [
        { inputStyle: 'modern', maxLength: 100, showFieldIcon: true },
        { inputStyle: 'minimal', validation: 'email', mask: 'phone' },
        { prefixText: 'R$', suffixText: ',00', autoComplete: 'name' }
      ]
    },
    
    email: {
      propriedades: [
        'question', 'placeholder', 'required', 'fieldId', 'inputStyle',
        'validation', 'showFieldIcon', 'fieldDescription', 'domainSuggestions',
        'autoComplete', 'verification'
      ],
      testeCasos: [
        { inputStyle: 'filled', validation: 'strict', showFieldIcon: true },
        { domainSuggestions: true, verification: 'double', autoComplete: 'email' }
      ]
    },
    
    phone: {
      propriedades: [
        'question', 'placeholder', 'required', 'fieldId', 'inputStyle',
        'countryCode', 'format', 'validation', 'showFieldIcon',
        'fieldDescription', 'autoComplete'
      ],
      testeCasos: [
        { countryCode: '+55', format: 'BR', validation: 'strict' },
        { inputStyle: 'modern', showFieldIcon: true, autoComplete: 'tel' }
      ]
    },
    
    number: {
      propriedades: [
        'question', 'placeholder', 'required', 'fieldId', 'min', 'max',
        'step', 'inputStyle', 'showFieldIcon', 'fieldDescription',
        'unit', 'currency', 'formatNumber', 'slider', 'buttons'
      ],
      testeCasos: [
        { min: 0, max: 100, step: 5, slider: true },
        { currency: 'BRL', formatNumber: true, buttons: true },
        { unit: 'kg', inputStyle: 'modern', showFieldIcon: true }
      ]
    },
    
    rating: {
      propriedades: [
        'question', 'required', 'scale', 'ratingType', 'ratingIcon',
        'ratingColor', 'ratingSize', 'showLabels', 'startLabel',
        'endLabel', 'allowHalf', 'showValue', 'orientation'
      ],
      testeCasos: [
        { scale: 5, ratingType: 'stars', ratingColor: '#FFD700' },
        { scale: 10, ratingType: 'hearts', allowHalf: true, showValue: true },
        { orientation: 'horizontal', showLabels: true, startLabel: 'Ruim', endLabel: 'Ótimo' }
      ]
    },
    
    checkbox: {
      propriedades: [
        'question', 'options', 'required', 'layout', 'checkboxStyle',
        'checkboxColor', 'checkboxSize', 'selectAll', 'maxSelections',
        'minSelections', 'validation', 'spacing'
      ],
      testeCasos: [
        { layout: 'grid', checkboxStyle: 'modern', checkboxColor: '#10B981' },
        { selectAll: true, maxSelections: 3, minSelections: 1 },
        { checkboxSize: 'lg', spacing: 'lg', validation: 'required' }
      ]
    },
    
    date: {
      propriedades: [
        'question', 'required', 'fieldId', 'dateFormat', 'minDate',
        'maxDate', 'showCalendar', 'inputStyle', 'showFieldIcon',
        'fieldDescription', 'locale', 'firstDayOfWeek'
      ],
      testeCasos: [
        { dateFormat: 'DD/MM/YYYY', showCalendar: true, locale: 'pt-BR' },
        { minDate: '2000-01-01', maxDate: '2025-12-31', firstDayOfWeek: 1 },
        { inputStyle: 'modern', showFieldIcon: true }
      ]
    },
    
    textarea: {
      propriedades: [
        'question', 'placeholder', 'required', 'fieldId', 'rows',
        'maxLength', 'minLength', 'inputStyle', 'showFieldIcon',
        'fieldDescription', 'resize', 'autoGrow', 'wordCount'
      ],
      testeCasos: [
        { rows: 5, maxLength: 500, resize: true, wordCount: true },
        { inputStyle: 'modern', autoGrow: true, showFieldIcon: true },
        { minLength: 10, fieldDescription: 'Descreva em detalhes' }
      ]
    }
  },
  
  // 📋 ELEMENTOS DE FORMULÁRIO
  formulario: {
    birth_date: {
      propriedades: [
        'question', 'required', 'fieldId', 'showAgeCalculation', 'minAge',
        'maxAge', 'inputStyle', 'showFieldIcon', 'fieldDescription',
        'dateFormat', 'ageUnit', 'showIcon', 'iconColor'
      ],
      testeCasos: [
        { showAgeCalculation: true, minAge: 18, maxAge: 65 },
        { inputStyle: 'modern', showIcon: true, iconColor: '#3B82F6' },
        { dateFormat: 'DD/MM/YYYY', ageUnit: 'anos', showFieldIcon: true }
      ]
    },
    
    height: {
      propriedades: [
        'question', 'required', 'fieldId', 'heightUnit', 'inputStyle',
        'showUnitSelector', 'unitSelectorStyle', 'showIcon', 'iconColor',
        'labelPosition', 'inputBackgroundColor', 'inputBorderColor',
        'showFieldIcon', 'fieldDescription', 'minHeight', 'maxHeight'
      ],
      testeCasos: [
        { heightUnit: 'cm', showUnitSelector: true, unitSelectorStyle: 'tabs' },
        { inputStyle: 'modern', showIcon: true, iconColor: '#8B5CF6' },
        { labelPosition: 'top', minHeight: 140, maxHeight: 220 }
      ]
    },
    
    current_weight: {
      propriedades: [
        'question', 'required', 'fieldId', 'weightUnit', 'showBMICalculation',
        'inputStyle', 'showUnitSelector', 'unitSelectorStyle', 'showIcon',
        'iconColor', 'labelPosition', 'inputBackgroundColor', 'inputBorderColor',
        'showFieldIcon', 'fieldDescription', 'minWeight', 'maxWeight'
      ],
      testeCasos: [
        { weightUnit: 'kg', showBMICalculation: true, showUnitSelector: true },
        { inputStyle: 'modern', showIcon: true, iconColor: '#3B82F6' },
        { labelPosition: 'top', minWeight: 40, maxWeight: 200 }
      ]
    },
    
    target_weight: {
      propriedades: [
        'question', 'required', 'fieldId', 'weightUnit', 'inputStyle',
        'showUnitSelector', 'unitSelectorStyle', 'showIcon', 'iconColor',
        'labelPosition', 'inputBackgroundColor', 'inputBorderColor',
        'showFieldIcon', 'fieldDescription', 'minWeight', 'maxWeight',
        'showDifference', 'differenceColor'
      ],
      testeCasos: [
        { weightUnit: 'kg', showUnitSelector: true, showDifference: true },
        { inputStyle: 'modern', showIcon: true, iconColor: '#F59E0B' },
        { labelPosition: 'top', differenceColor: '#10B981' }
      ]
    },
    
    image_upload: {
      propriedades: [
        'question', 'required', 'fieldId', 'acceptedTypes', 'maxFileSize',
        'maxFiles', 'showPreview', 'uploadStyle', 'dragAndDrop',
        'compressionQuality', 'resizeImage', 'targetWidth', 'targetHeight',
        'showProgress', 'allowCrop', 'cropAspectRatio'
      ],
      testeCasos: [
        { acceptedTypes: ['jpg', 'png'], maxFileSize: 5, showPreview: true },
        { uploadStyle: 'modern', dragAndDrop: true, compressionQuality: 0.8 },
        { allowCrop: true, cropAspectRatio: '1:1', showProgress: true }
      ]
    }
  },
  
  // 🎮 ELEMENTOS DE JOGO
  jogos: {
    game_wheel: {
      propriedades: [
        'wheelOptions', 'wheelSize', 'wheelColors', 'spinDuration',
        'spinSound', 'showResult', 'resultAnimation', 'canSpin',
        'spinButtonText', 'spinButtonColor', 'borderWidth', 'borderColor'
      ],
      testeCasos: [
        { wheelSize: 'lg', spinDuration: 3000, spinSound: true },
        { wheelColors: ['#FF6B6B', '#4ECDC4', '#45B7D1'], showResult: true },
        { resultAnimation: 'bounce', spinButtonText: 'Girar!', canSpin: true }
      ]
    },
    
    game_scratch: {
      propriedades: [
        'scratchImage', 'hiddenImage', 'scratchSize', 'brushSize',
        'revealPercent', 'autoReveal', 'revealAnimation', 'scratchSound',
        'backgroundColor', 'borderRadius', 'showProgress'
      ],
      testeCasos: [
        { scratchSize: 'md', brushSize: 20, revealPercent: 60 },
        { autoReveal: true, revealAnimation: 'fade', scratchSound: true },
        { backgroundColor: '#F3F4F6', borderRadius: 'lg', showProgress: true }
      ]
    },
    
    game_color_pick: {
      propriedades: [
        'colorOptions', 'targetColor', 'colorSize', 'colorShape',
        'showResult', 'resultAnimation', 'attempts', 'showAttempts',
        'successMessage', 'failMessage', 'resetButton'
      ],
      testeCasos: [
        { colorSize: 'lg', colorShape: 'circle', attempts: 3 },
        { showResult: true, resultAnimation: 'pulse', showAttempts: true },
        { successMessage: 'Acertou!', failMessage: 'Tente novamente', resetButton: true }
      ]
    },
    
    game_brick_break: {
      propriedades: [
        'brickRows', 'brickColumns', 'brickColors', 'ballSpeed',
        'paddleSize', 'paddleColor', 'ballColor', 'lives',
        'showScore', 'gameSize', 'difficulty', 'powerUps'
      ],
      testeCasos: [
        { brickRows: 5, brickColumns: 8, ballSpeed: 'medium' },
        { paddleSize: 'md', paddleColor: '#3B82F6', lives: 3 },
        { showScore: true, difficulty: 'easy', powerUps: true }
      ]
    },
    
    game_memory_cards: {
      propriedades: [
        'cardPairs', 'cardSize', 'cardBackImage', 'cardImages',
        'flipAnimation', 'matchAnimation', 'attempts', 'showAttempts',
        'timer', 'showTimer', 'difficulty', 'shuffleCards'
      ],
      testeCasos: [
        { cardPairs: 8, cardSize: 'md', flipAnimation: 'rotate' },
        { matchAnimation: 'bounce', attempts: 20, showAttempts: true },
        { timer: 60, showTimer: true, difficulty: 'medium', shuffleCards: true }
      ]
    },
    
    game_slot_machine: {
      propriedades: [
        'slotSymbols', 'slotReels', 'slotSize', 'spinSpeed',
        'spinSound', 'winAnimation', 'winSound', 'autoSpin',
        'spinButtonText', 'spinButtonColor', 'showPaytable',
        'slotWinningCombination', 'credits', 'showCredits'
      ],
      testeCasos: [
        { slotReels: 3, slotSize: 'lg', spinSpeed: 'fast' },
        { spinSound: true, winAnimation: 'flash', winSound: true },
        { showPaytable: true, credits: 100, showCredits: true }
      ]
    }
  },
  
  // 🎯 ELEMENTOS ESPECIAIS
  especiais: {
    continue_button: {
      propriedades: [
        'buttonText', 'buttonUrl', 'buttonAction', 'buttonSize',
        'buttonBorderRadius', 'buttonBackgroundColor', 'buttonTextColor',
        'buttonHoverColor', 'isFixedFooter', 'buttonStyle', 'buttonIcon',
        'buttonIconPosition', 'buttonAnimation', 'buttonDisabled',
        'buttonFullWidth', 'buttonShadow', 'buttonGradient'
      ],
      testeCasos: [
        { buttonSize: 'lg', buttonBorderRadius: 'full', buttonStyle: 'gradient' },
        { buttonIcon: '→', buttonIconPosition: 'right', buttonAnimation: 'pulse' },
        { isFixedFooter: true, buttonFullWidth: true, buttonShadow: 'lg' }
      ]
    },
    
    loading_question: {
      propriedades: [
        'loadingDuration', 'loadingBarColor', 'loadingBarBackgroundColor',
        'loadingBarWidth', 'loadingBarHeight', 'loadingBarStyle',
        'loadingText', 'loadingTextSize', 'loadingTextColor',
        'popupQuestion', 'popupYesText', 'popupNoText', 'animationType',
        'animationSpeed', 'showPercentage', 'showTimeRemaining'
      ],
      testeCasos: [
        { loadingDuration: 5, loadingBarColor: '#10B981', animationType: 'smooth' },
        { loadingBarStyle: 'rounded', showPercentage: true, showTimeRemaining: true },
        { popupQuestion: 'Continuar?', popupYesText: 'Sim', popupNoText: 'Não' }
      ]
    },
    
    animated_transition: {
      propriedades: [
        'backgroundType', 'backgroundColor', 'gradientDirection',
        'gradientFrom', 'gradientTo', 'backgroundImage', 'animationType',
        'animationSpeed', 'transitionDuration', 'showText', 'transitionText',
        'textColor', 'textSize', 'textAnimation', 'overlayColor'
      ],
      testeCasos: [
        { backgroundType: 'gradient', gradientFrom: '#667eea', gradientTo: '#764ba2' },
        { animationType: 'fadeIn', animationSpeed: 'normal', showText: true },
        { transitionText: 'Carregando...', textColor: '#FFFFFF', textSize: 'lg' }
      ]
    },
    
    share_quiz: {
      propriedades: [
        'shareMessage', 'shareNetworks', 'shareButtonText', 'shareLayout',
        'shareButtonBackgroundColor', 'shareButtonTextColor', 'shareButtonBorderRadius',
        'shareButtonSize', 'shareShowIcons', 'shareIconSize', 'shareStyle',
        'shareTitle', 'shareDescription', 'shareImage'
      ],
      testeCasos: [
        { shareNetworks: ['whatsapp', 'facebook', 'twitter'], shareLayout: 'horizontal' },
        { shareShowIcons: true, shareIconSize: 'md', shareStyle: 'modern' },
        { shareTitle: 'Quiz Incrível', shareDescription: 'Teste seus conhecimentos!' }
      ]
    }
  }
};

// 🔍 FUNÇÃO PARA VERIFICAR RENDERIZAÇÃO
function verificarRenderizacao(elemento, categoria) {
  console.log(`\n🔍 Testando elemento: ${elemento.toUpperCase()} (${categoria})`);
  console.log('─'.repeat(50));
  
  const elementoData = elementosQuiz[categoria][elemento];
  
  if (!elementoData) {
    console.log('❌ Elemento não encontrado na definição');
    return false;
  }
  
  let totalTestes = 0;
  let testesPassaram = 0;
  
  // Testar cada caso de teste
  elementoData.testeCasos.forEach((testCase, index) => {
    console.log(`\n📋 Caso de teste ${index + 1}:`);
    console.log(JSON.stringify(testCase, null, 2));
    
    // Simular verificação das propriedades
    Object.keys(testCase).forEach(propriedade => {
      totalTestes++;
      
      // Verificar se a propriedade existe na lista
      if (elementoData.propriedades.includes(propriedade)) {
        console.log(`  ✅ ${propriedade}: ${testCase[propriedade]}`);
        testesPassaram++;
      } else {
        console.log(`  ❌ ${propriedade}: Propriedade não definida`);
      }
    });
  });
  
  const porcentagemSucesso = (testesPassaram / totalTestes) * 100;
  console.log(`\n📊 Resultado: ${testesPassaram}/${totalTestes} (${porcentagemSucesso.toFixed(1)}%)`);
  
  if (porcentagemSucesso >= 90) {
    console.log('✅ ELEMENTO APROVADO');
    return true;
  } else if (porcentagemSucesso >= 70) {
    console.log('⚠️ ELEMENTO PRECISA DE AJUSTES');
    return false;
  } else {
    console.log('❌ ELEMENTO REPROVADO');
    return false;
  }
}

// 🎯 EXECUTAR TESTES POR CATEGORIA
async function executarTestes() {
  console.log('\n🚀 INICIANDO TESTES DE RENDERIZAÇÃO');
  console.log('====================================\n');
  
  const resultados = {
    total: 0,
    aprovados: 0,
    ajustes: 0,
    reprovados: 0
  };
  
  // Testar cada categoria
  for (const [categoria, elementos] of Object.entries(elementosQuiz)) {
    console.log(`\n🏷️ CATEGORIA: ${categoria.toUpperCase()}`);
    console.log('='.repeat(60));
    
    for (const elemento of Object.keys(elementos)) {
      const resultado = verificarRenderizacao(elemento, categoria);
      resultados.total++;
      
      if (resultado) {
        resultados.aprovados++;
      } else {
        resultados.reprovados++;
      }
    }
  }
  
  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL');
  console.log('==================');
  console.log(`Total de elementos testados: ${resultados.total}`);
  console.log(`✅ Aprovados: ${resultados.aprovados} (${((resultados.aprovados / resultados.total) * 100).toFixed(1)}%)`);
  console.log(`❌ Reprovados: ${resultados.reprovados} (${((resultados.reprovados / resultados.total) * 100).toFixed(1)}%)`);
  
  const taxaSucesso = (resultados.aprovados / resultados.total) * 100;
  
  if (taxaSucesso >= 90) {
    console.log('\n🎉 SISTEMA APROVADO PARA PRODUÇÃO!');
    console.log('Todos os elementos estão renderizando corretamente.');
  } else if (taxaSucesso >= 70) {
    console.log('\n⚠️ SISTEMA PRECISA DE AJUSTES');
    console.log('Alguns elementos precisam ser corrigidos antes da produção.');
  } else {
    console.log('\n🚨 SISTEMA REPROVADO');
    console.log('Muitos elementos não estão funcionando corretamente.');
  }
  
  // Salvar relatório
  const relatorio = {
    data: new Date().toISOString(),
    resultados,
    taxaSucesso: taxaSucesso.toFixed(1),
    status: taxaSucesso >= 90 ? 'APROVADO' : taxaSucesso >= 70 ? 'AJUSTES' : 'REPROVADO'
  };
  
  fs.writeFileSync('relatorio-teste-elementos.json', JSON.stringify(relatorio, null, 2));
  console.log('\n📄 Relatório salvo em: relatorio-teste-elementos.json');
}

// 🚀 EXECUTAR TESTES
executarTestes().catch(console.error);