/* ============================================================
   My Creative Journal - 交互引擎
   ============================================================ */
(function () {
  'use strict';

  var works = Array.isArray(window.PORTFOLIO_WORKS) ? window.PORTFOLIO_WORKS : [];
  var $ = function (id) { return document.getElementById(id); };

  function group(g) {
    return works.filter(function (w) { return w.group === g; })
      .sort(function (a, b) { return a.file.localeCompare(b.file, 'zh-CN'); });
  }
  function byGroups(gs) {
    return gs.reduce(function (acc, g) { return acc.concat(group(g)); }, []);
  }
  function pick(g, n) { return group(g).slice(0, n); }

  /* ---------- 生成页面内容 HTML ---------- */
  function head(eyebrow, title, sub) {
    return '<div class="page-head"><div><span class="page-eyebrow">' + eyebrow + '</span>' +
      '<h2 class="page-title">' + title + '</h2></div>' +
      '<p class="page-sub">' + (sub || '') + '</p></div><div class="divider"></div>';
  }
  function scroller(inner) { return '<div class="scroll-area">' + inner + '</div>'; }

  function polaroidCard(w) {
    return '<figure class="polaroid" data-zoom="' + w.file + '" data-cap="' + w.title + '">' +
      '<span class="pin"></span><img loading="lazy" src="' + w.file + '" alt="' + w.title + '" />' +
      '<figcaption>' + w.title + '</figcaption></figure>';
  }
  function archiveCard(w, tag) {
    return '<div class="archive-card"><img loading="lazy" data-zoom="' + w.file + '" data-cap="' + w.title + '" src="' + w.file + '" alt="' + w.title + '" />' +
      '<div class="body"><h4>' + w.title + '</h4><p>' + w.label + '</p>' +
      (tag ? '<span class="tag-mini">' + tag + '</span>' : '') + '</div></div>';
  }
  function fitMedia(media, maxH) {
    var w = media.videoWidth || media.naturalWidth;
    var h = media.videoHeight || media.naturalHeight;
    if (!w || !h) return;
    var host = media.parentElement;
    if (!host) return;
    var cs = window.getComputedStyle(host);
    var padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
    var maxW = host.clientWidth - padX;
    if (maxW <= 0) return;
    var ratio = w / h;
    var outW = maxW;
    var outH = maxW / ratio;
    if (outH > maxH) { outH = maxH; outW = maxH * ratio; }
    media.style.width = Math.round(outW) + 'px';
    media.style.height = Math.round(outH) + 'px';
  }
  function applyMediaFit() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-fit]'), function (img) {
      if (img.complete) fitMedia(img, parseFloat(img.getAttribute('data-fit-max')) || 132);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.video-frame video'), function (video) {
      if (video.readyState >= 1) {
        var frame = video.closest('.video-frame');
        fitMedia(video, frame && frame.classList.contains('video-frame--compact') ? 240 : 320);
      }
    });
  }
  function videoBlock(v, compact) {
    return '<div class="video-frame video-frame--auto' + (compact ? ' video-frame--compact' : '') + '">' +
      '<video controls preload="metadata" playsinline poster="' + (v.poster || '') + '" src="' + v.file + '"></video></div>' +
      '<div class="video-label">▶ ' + v.title + (v.label ? ' · ' + v.label : '') + '</div>';
  }
  function figureCard(w, cls, cap) {
    return '<figure class="' + cls + '"><img loading="lazy" data-zoom="' + w.file + '" data-cap="' + w.title + '" src="' + w.file + '" alt="' + w.title + '" />' +
      (cap ? '<figcaption>' + w.title + '</figcaption>' : '') + '</figure>';
  }

  var COURSE = [
    { code: 'lichun', name: 'AI学习 · 立春日记', desc: '手绘角色概念 / AI 辅助画面延展', files: ['lichun-03.png', 'lichun-04.png', 'lichun-01.png', 'lichun-02.png'] },
    { code: 'figma', name: 'Figma 海报', desc: '海报版式设计练习', files: ['figma-01.png', 'figma-02.png', 'figma-03.png'] },
    { code: 'vrroom', name: 'UE5 VR · 一隅小窝', desc: '沉浸式空间项目', files: ['vrroom-02.png'], video: 'vrroom-01.mp4' },
    { code: 'nav', name: '导航网页', desc: '网页界面设计练习', files: ['nav-01.png', 'nav-02.png', 'nav-03.png'] },
    { code: 'lamp', name: '交互灯', desc: '交互装置记录', files: ['lamp-01.jpg', 'lamp-02.jpg'] },
    { code: 'boxin', name: '波动 · 心距', desc: '交互动态视觉 / 情绪可视化', files: ['boxin-09.png'], video: 'boxin-06.mp4' }
  ];
  function courseCard(p, i) {
    var img = p.files[0] ? 'assets/course/' + p.code + '/' + p.files[0] : '';
    return '<article class="course-card" ' + (img ? 'data-zoom="' + img + '" data-cap="' + p.name + '"' : '') + '>' +
      '<span class="num">0' + (i + 1) + '</span>' +
      (img ? '<img loading="lazy" data-fit data-fit-max="132" src="' + img + '" alt="' + p.name + '" />' : '') +
      '<h5>' + p.name + '</h5><p>' + p.desc + '</p></article>';
  }

  /* ---------- 跨页内容定义 ---------- */
  var TOC = [
    { id: 'about', label: '关于我', en: 'ABOUT', spread: 1, color: '#E482A6' },
    { id: 'illus', label: '插画', en: 'ILLUSTRATION', spread: 2, color: '#8FBFD6' },
    { id: 'motion', label: '动态', en: 'MOTION', spread: 4, color: '#A7C9A8' },
    { id: 'three', label: '三维 / UE5', en: '3D & UE5', spread: 5, color: '#B9A3D4' },
    { id: 'course', label: '课程实践', en: 'COURSE', spread: 6, color: '#E0B36B' },
    { id: 'sticker', label: '贴纸游戏', en: 'STICKER PLAY', spread: 7, color: '#E39BB5' },
    { id: 'contact', label: '联系方式', en: 'CONTACT', spread: 8, color: '#9DC4D6' }
  ];

  function tocHTML() {
    return head('CONTENTS / 目录', '<em>Contents</em>', '点击条目或右侧标签跳转章节') +
      '<ul class="toc-list">' + TOC.map(function (t, i) {
        return '<li class="toc-item" data-go="' + t.spread + '"><span class="toc-num">' + ('0' + (i + 1)) + '</span>' +
          '<span class="toc-label">' + t.label + '</span><span class="toc-en">' + t.en + '</span>' +
          '<span class="toc-dot" style="background:' + t.color + '"></span></li>';
      }).join('') + '</ul>' +
      '<span class="scribble" style="position:absolute;bottom:18px;right:26px;transform:rotate(-6deg)">flip →</span>';
  }
  function frontisHTML() {
    return '<div class="frontispiece"><div class="frame">EST. 2026</div>' +
      '<div class="hand">♡ welcome to my little world ♡</div>' +
      '<div class="big">A handmade<br /><em>portfolio</em><br />journal</div>' +
      '<div class="meta">插画 · 动态 · 三维 · 课程实践</div></div>';
  }
  function aboutLeft() {
    return head('01 / ABOUT', '<em>About</em> me', '个人档案 · 暂留占位') +
      '<div class="about-card"><span class="clip"></span>' +
      '<div class="about-row"><b>姓名</b><span>〔待填写〕</span></div>' +
      '<div class="about-row"><b>学校专业</b><span>〔待填写〕</span></div>' +
      '<div class="about-row"><b>个人简介</b><span>〔待填写〕这里将放置简短介绍。</span></div>' +
      '<div class="about-row"><b>设计方向</b><span>〔待填写〕</span></div></div>' +
      '<div class="placeholder-box">✿ 更多真实资料待补充 ✿</div>';
  }
  function aboutRight() {
    return head('PROFILE', 'My <em>skills</em>', '兴趣与技能标签') +
      '<div class="receipt"><h4>✿ INTERESTS &amp; SKILLS ✿</h4>' +
      '<p>DRAWING / ILLUSTRATION</p><p>MOTION / ANIMATION</p><p>3D / UE5</p>' +
      '<p>────────────────</p><p>NO. 2026-0001</p></div>' +
      '<div class="chip-list"><span class="chip">板绘</span><span class="chip b">动态</span><span class="chip g">三维</span><span class="chip l">UE5</span><span class="chip">拼贴</span></div>' +
      '<span class="sticky" style="bottom:24px;right:24px;transform:rotate(5deg)">Every day is<br />a new page ♡</span>';
  }

  function illusLeft() {
    var w = pick('board', 9);
    return scroller(head('02 / ILLUSTRATION', 'Illustration <em>01</em>', '板绘插画 · 放大缩略图') +
      '<div class="tape tape--top"></div>' +
      '<div class="polaroid-grid polaroid-grid--large">' + w.map(polaroidCard).join('') + '</div>');
  }
  function illusRight() {
    var pub = group('public');
    var originals = pub.filter(function (x) { return x.title.indexOf('原画') === 0; });
    var supports = pub.filter(function (x) { return x.title === '实物展示' || x.title.indexOf('现场照片') === 0; }).slice(0, 3);
    return scroller(head('ILLUSTRATION', '<em>Original</em> works', '公益主题 · 原画为主，实物辅助') +
      '<span class="scribble">原画完整展示 · 实物照片辅助</span>' +
      '<div class="mosaic mosaic--original">' + originals.map(function (x) { return '<img loading="lazy" data-zoom="' + x.file + '" data-cap="' + x.title + '" src="' + x.file + '" alt="' + x.title + '" />'; }).join('') + '</div>' +
      '<div class="divider"></div>' +
      '<div class="support-strip">' + supports.map(function (x) { return figureCard(x, 'support-figure', true); }).join('') + '</div>');
  }
  function illus2Left() {
    var ch = group('character');
    return scroller(head('ILLUSTRATION 02', 'Character <em>design</em>', '角色设定 · 比例 / 配色 / 层次') +
      '<div class="mini-note">设定分析：Q版与正比比例并行；红底、蓝底证件照用于区分配色版本；背景、人物、前景分层构成完整画面。</div>' +
      '<h3 class="section-label">Q版设定</h3>' +
      '<div class="setting-grid">' + ch.slice(0, 7).map(function (x) { return figureCard(x, 'setting-figure', true); }).join('') + '</div>' +
      '<h3 class="section-label">证件照配色</h3>' +
      '<div class="setting-grid setting-grid--id">' + ch.slice(25, 33).map(function (x) { return figureCard(x, 'setting-figure', true); }).join('') + '</div>' +
      '<h3 class="section-label">画面层次</h3>' +
      '<div class="layer-strip">' + ch.slice(33, 36).map(function (x) { return figureCard(x, 'setting-figure', true); }).join('') + '</div>');
  }
  function illus2Right() {
    var ch = group('character');
    var feature = ch[24];
    var full = ch.slice(7, 24);
    return scroller(head('CHARACTER', '<em>Full</em> illustrations', '角色立绘 · 正比 / 合集') +
      (feature ? '<figure class="character-feature"><img loading="lazy" data-zoom="' + feature.file + '" data-cap="' + feature.title + '" src="' + feature.file + '" alt="' + feature.title + '" /><figcaption>' + feature.title + '</figcaption></figure>' : '') +
      '<h3 class="section-label">正比立绘 · 全部 17 张</h3>' +
      '<div class="character-wall">' + full.map(function (x) { return figureCard(x, 'character-cell', false); }).join('') + '</div>');
  }
  function motionLeft() {
    var vids = group('motion-video');
    var html = head('03 / MOTION', '<em>Motion</em> works', '动态创作 · 保留原始横竖比例') + '<div class="tape tape--top"></div>';
    vids.forEach(function (v) { html += videoBlock(v, false); });
    return scroller(html);
  }
  function motionRight() {
    var frames = byGroups(['motion-frame-a', 'motion-frame-b']);
    return scroller(head('KEY FRAMES', 'Film <em>strip</em>', '精选关键帧 · 电影胶片') +
      '<div class="filmstrip"><div class="film-frames">' +
      frames.map(function (f) { return '<img loading="lazy" data-zoom="' + f.file + '" data-cap="' + f.title + '" src="' + f.file + '" alt="' + f.title + '" />'; }).join('') +
      '</div></div>' +
      '<span class="scribble">※ 仅展示精选帧，完整动画请播放左页视频</span>');
  }
  function threeLeft() {
    var m = group('model');
    return head('04 / 3D', '3D <em>modeling</em>', '三维建模专题') +
      '<img class="feature-shot" data-zoom="' + m[0].file + '" data-cap="' + m[0].title + '" src="' + m[0].file + '" alt="' + m[0].title + '" />' +
      '<h4 style="font-size:13px;margin:8px 0 4px">' + m[0].title + '</h4>' +
      (m[1] ? archiveCard(m[1], '3D') : '') +
      '<span class="sticky" style="bottom:16px;left:18px;transform:rotate(-4deg)">detail ✦</span>';
  }
  function threeRight() {
    var day = group('ue5-day'), night = group('ue5-night'), detail = group('ue5-detail');
    var pickDay = day[day.length - 1], pickNight = night[0];
    return scroller(head('UE5 / SCENE', '<em>Environments</em>', '白天 / 夜晚 / 局部') +
      '<div class="mosaic">' +
      [pickDay, pickNight].filter(Boolean).map(function (x) { return '<img loading="lazy" data-zoom="' + x.file + '" data-cap="' + x.label + '" src="' + x.file + '" alt="' + x.label + '" />'; }).join('') +
      '</div><div class="divider"></div>' +
      detail.slice(0, 2).map(function (x) { return archiveCard(x, '细节'); }).join(''));
  }
  function courseLeft() {
    return scroller(head('05 / COURSE', '<em>Course</em> projects', '课程实践 · 辅助展示') +
      '<div class="course-grid">' + COURSE.slice(0, 4).map(courseCard).join('') + '</div>');
  }
  function courseRight() {
    return scroller(head('COURSE 02', 'More <em>practice</em>', '展板与交互项目 · 保留原始比例') +
      '<div class="course-grid">' + COURSE.slice(4).map(courseCard).join('') + '</div>' +
      videoBlock({ file: 'assets/course/boxin/boxin-06.mp4', poster: 'assets/course/boxin/boxin-09.png', title: '波动 · 心距', label: '竖屏主题视频' }, true));
  }
  function stickerLeft() {
    return head('06 / PLAY', '<em>Sticker</em> playground', '把贴纸拖到素体上') +
      '<div class="mini-note">✿ 从右侧贴纸盘拖动眼睛、嘴巴、腮红、蝴蝶结到中间的素体。<br>✿ 可再次拖动调整位置，双击贴纸可移除。<br>✿ 点击「重置」清空，「保存」生成拍立得图片。</div>' +
      '<span class="sticky" style="bottom:26px;left:20px;transform:rotate(-5deg)">have fun ♡</span>';
  }
  function stickerRight() {
    return '<div class="sticker-game">' +
      '<div class="game-toolbar"><h3>Decorate me!</h3><div class="game-btns">' +
      '<button class="game-btn" id="gameReset" type="button">重置</button>' +
      '<button class="game-btn" id="gameSave" type="button">保存拍立得</button></div></div>' +
      '<div class="game-body"><div class="game-canvas" id="gameCanvas">' +
      '<svg class="game-doll" viewBox="0 0 180 210" aria-hidden="true">' +
      '<ellipse cx="90" cy="86" rx="62" ry="70" fill="#FFF3E6" stroke="#E8C9B4" stroke-width="2"/>' +
      '<path d="M40 60 Q90 6 140 60" fill="none" stroke="#E8C9B4" stroke-width="2"/>' +
      '<ellipse cx="62" cy="150" rx="10" ry="5" fill="#FFE0E8"/><ellipse cx="118" cy="150" rx="10" ry="5" fill="#FFE0E8"/>' +
      '<path d="M74 170 Q90 182 106 170" fill="none" stroke="#E8C9B4" stroke-width="2"/>' +
      '<path d="M30 200 Q90 150 150 200" fill="#FFF3E6" stroke="#E8C9B4" stroke-width="2"/>' +
      '</svg></div><div class="game-tray" id="gameTray"></div></div>' +
      '<div class="game-tip">支持鼠标与触摸拖动 · 贴纸可自由摆放</div></div>';
  }
  function contactLeft() {
    return head('07 / CONTACT', 'A little <em>letter</em>', '联系方式 · 待补充') +
      '<div class="letter"><span class="stamp">✿<br />MAIL</span>' +
      '<h3>Dear you,</h3>' +
      '<p>感谢你翻到这里 ♡</p>' +
      '<p>邮箱：〔待补充真实邮箱〕</p>' +
      '<p>社交主页：〔待补充〕</p>' +
      '<p>合作方式：〔待补充〕</p>' +
      '<p style="text-align:right;font-family:var(--font-hand);color:var(--pink-deep);font-style:italic">yours, ✿</p></div>';
  }
  function contactRight() {
    return head('POSTCARD', '<em>Thank you</em>!', '预留位置') +
      '<div class="postcard"><div class="msg">感谢翻阅<br />这本小小的创作手账<br />♡ fin. ♡</div>' +
      '<div class="addr"><span>To: 〔待填写〕</span><span>2026 / 〔待填写〕</span></div></div>' +
      '<div class="placeholder-box" style="margin-top:14px">项目经历 · 获奖经历 预留位置</div>' +
      '<span class="scribble" style="position:absolute;bottom:16px;left:20px">see you next page →</span>';
  }

  var SPREADS = [
    { left: frontisHTML, right: tocHTML, label: '扉页 / 目录' },
    { left: aboutLeft, right: aboutRight, label: '关于我' },
    { left: illusLeft, right: illusRight, label: '插画 01' },
    { left: illus2Left, right: illus2Right, label: '插画 02' },
    { left: motionLeft, right: motionRight, label: '动态' },
    { left: threeLeft, right: threeRight, label: '三维 / UE5' },
    { left: courseLeft, right: courseRight, label: '课程实践' },
    { left: stickerLeft, right: stickerRight, label: '贴纸游戏' },
    { left: contactLeft, right: contactRight, label: '联系方式' }
  ];

  /* ---------- 翻页引擎 ---------- */
  var index = 0;
  var animating = false;
  var isOpen = false;
  var cover = $('cover'), spread = $('spread');
  var paperL = $('paperLeft'), paperR = $('paperRight');
  var flip = $('flipper'), flipF = $('flipFront'), flipB = $('flipBack');

  function renderStatic(i, leftHTML, rightHTML) {
    paperL.innerHTML = leftHTML != null ? leftHTML : SPREADS[i].left();
    paperR.innerHTML = rightHTML != null ? rightHTML : SPREADS[i].right();
    setTimeout(applyMediaFit, 0);
  }
  function updateUI() {
    $('pageCount').textContent = (index + 1) + ' / ' + SPREADS.length;
    $('prevBtn').disabled = index <= 0;
    $('nextBtn').disabled = index >= SPREADS.length - 1;
    Array.prototype.forEach.call(document.querySelectorAll('.tab-pill'), function (p, k) {
      p.classList.toggle('is-active', TOC[k] && TOC[k].spread === index);
    });
    if (index === 7) initGame();
  }
  function openBook() {
    if (isOpen) return;
    isOpen = true;
    cover.classList.add('is-open');
    setTimeout(function () {
      cover.hidden = true;
      spread.hidden = false;
      renderStatic(0);
      updateUI();
      $('toptools').hidden = false;
      $('tabsRail').hidden = false;
      $('controls').hidden = false;
    }, 700);
  }
  function turnTo(target, dir) {
    if (animating || target < 0 || target >= SPREADS.length || target === index) return;
    animating = true;
    var next = dir === 'next' ? index + 1 : index - 1;
    if (next !== target) { // 索引跳转：逐页过渡
      turnStep(index, next, function () { turnTo(target, target > next ? 'next' : 'prev'); });
      return;
    }
    turnStep(index, target, function () { animating = false; updateUI(); });
  }
  function turnStep(from, to, done) {
    var forward = to > from;
    var cur = SPREADS[from], tgt = SPREADS[to];
    // 底层：前翻 left=当前 left, right=目标 right；后翻 left=目标 left, right=当前 right
    paperL.innerHTML = forward ? cur.left() : tgt.left();
    paperR.innerHTML = forward ? tgt.right() : cur.right();
    flipF.innerHTML = forward ? cur.right() : tgt.right();
    flipB.innerHTML = forward ? tgt.left() : cur.left();
    flip.style.transform = forward ? 'rotateY(0deg)' : 'rotateY(-180deg)';
    flip.hidden = false;
    // force reflow
    void flip.offsetWidth;
    requestAnimationFrame(function () {
      flip.classList.add('is-flipping');
      flip.style.transform = forward ? 'rotateY(-180deg)' : 'rotateY(0deg)';
    });
    setTimeout(function () {
      flip.hidden = true;
      flip.classList.remove('is-flipping');
      index = to;
      renderStatic(to);
      done();
    }, 880);
  }

  /* ---------- 事件绑定 ---------- */
  cover.addEventListener('click', openBook);
  cover.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBook(); } });
  $('nextBtn').addEventListener('click', function () { turnTo(index + 1, 'next'); });
  $('prevBtn').addEventListener('click', function () { turnTo(index - 1, 'prev'); });

  // 索引标签
  $('tabsRail').innerHTML = TOC.map(function (t) {
    return '<button class="tab-pill" type="button" data-go="' + t.spread + '" style="background:' + t.color + '">' + t.label + '</button>';
  }).join('');
  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go && isOpen) { turnTo(parseInt(go.getAttribute('data-go'), 10), null); }
  });

  // 点击书页边缘翻页
  function edgeClick(e, side) {
    if (!isOpen || animating) return;
    var rect = e.currentTarget.getBoundingClientRect();
    var x = e.clientX - rect.left;
    if (side === 'right' && x > rect.width * 0.86) turnTo(index + 1, 'next');
    if (side === 'left' && x < rect.width * 0.14) turnTo(index - 1, 'prev');
  }
  $('sheetRight').addEventListener('click', function (e) { edgeClick(e, 'right'); });
  $('sheetLeft').addEventListener('click', function (e) { edgeClick(e, 'left'); });

  // 拖动翻页
  var dragX = null;
  spread.addEventListener('pointerdown', function (e) { dragX = e.clientX; });
  spread.addEventListener('pointerup', function (e) {
    if (dragX == null) return;
    var dx = e.clientX - dragX; dragX = null;
    if (Math.abs(dx) < 60) return;
    if (dx < 0) turnTo(index + 1, 'next'); else turnTo(index - 1, 'prev');
  });

  // 键盘翻页
  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'ArrowRight') turnTo(index + 1, 'next');
    if (e.key === 'ArrowLeft') turnTo(index - 1, 'prev');
  });

  // 灯箱
  var lb = $('lightbox');
  document.addEventListener('click', function (e) {
    var z = e.target.closest('[data-zoom]');
    if (z) { $('lightboxImg').src = z.getAttribute('data-zoom'); $('lightboxCap').textContent = z.getAttribute('data-cap') || ''; lb.hidden = false; }
  });
  $('lightboxClose').addEventListener('click', function () { lb.hidden = true; });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.hidden = true; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.hidden = true; });

  document.addEventListener('loadedmetadata', function (e) {
    if (e.target.tagName === 'VIDEO') applyMediaFit();
  }, true);
  document.addEventListener('load', function (e) {
    if (e.target.tagName === 'IMG' && e.target.hasAttribute('data-fit')) applyMediaFit();
  }, true);
  window.addEventListener('resize', applyMediaFit);

  /* ---------- 贴纸小游戏 ---------- */
  var STICKERS = [
    { icon: '👀', label: '眼睛' }, { icon: '👄', label: '嘴巴' },
    { icon: '🌸', label: '腮红' }, { icon: '🎀', label: '蝴蝶结' },
    { icon: '⭐', label: '星星' }, { icon: '💗', label: '爱心' },
    { icon: '✿', label: '小花' }, { icon: '✨', label: '闪光' }
  ];
  var gameInited = false;
  function initGame() {
    if (gameInited) return;
    var tray = $('gameTray'); if (!tray) return;
    gameInited = true;
    tray.innerHTML = STICKERS.map(function (s, i) {
      return '<div class="sticker-item" data-sticker="' + i + '" title="拖动 ' + s.label + '">' + s.icon + '</div>';
    }).join('');

    var canvas = $('gameCanvas');
    function place(icon, x, y) {
      var el = document.createElement('div');
      el.className = 'placed'; el.textContent = icon;
      el.style.fontSize = '34px';
      el.style.left = x + 'px'; el.style.top = y + 'px';
      canvas.appendChild(el);
      makeDraggable(el);
      return el;
    }
    function makeDraggable(el) {
      el.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        var rect = canvas.getBoundingClientRect();
        var ox = e.clientX - rect.left - el.offsetLeft;
        var oy = e.clientY - rect.top - el.offsetTop;
        el.style.cursor = 'grabbing'; el.style.zIndex = 9;
        function move(ev) {
          var nx = Math.max(0, Math.min(canvas.clientWidth - el.offsetWidth, ev.clientX - rect.left - ox));
          var ny = Math.max(0, Math.min(canvas.clientHeight - el.offsetHeight, ev.clientY - rect.top - oy));
          el.style.left = nx + 'px'; el.style.top = ny + 'px';
        }
        function up() {
          el.style.cursor = 'grab'; el.style.zIndex = 5;
          document.removeEventListener('pointermove', move);
          document.removeEventListener('pointerup', up);
        }
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', up);
      });
      el.addEventListener('dblclick', function () { el.remove(); });
    }
    Array.prototype.forEach.call(tray.querySelectorAll('[data-sticker]'), function (item) {
      item.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        var icon = STICKERS[parseInt(item.getAttribute('data-sticker'), 10)].icon;
        var rect = canvas.getBoundingClientRect();
        var el = place(icon, Math.max(0, Math.min(canvas.clientWidth - 40, e.clientX - rect.left - 17)), Math.max(0, Math.min(canvas.clientHeight - 40, e.clientY - rect.top - 17)));
        // 让用户可以直接继续拖动刚放下的贴纸
        var evt = new PointerEvent('pointerdown', { bubbles: true, clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId });
        el.dispatchEvent(evt);
      });
    });
    $('gameReset').addEventListener('click', function () {
      Array.prototype.forEach.call(canvas.querySelectorAll('.placed'), function (p) { p.remove(); });
    });
    $('gameSave').addEventListener('click', function () {
      try {
        var W = 480, H = 600, pad = 28, photoH = 420;
        var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        var c = cv.getContext('2d');
        c.fillStyle = '#FFFDF8'; c.fillRect(0, 0, W, H);
        c.fillStyle = '#FFF3E6'; c.fillRect(pad, pad, W - pad * 2, photoH);
        c.strokeStyle = '#F3A7C0'; c.lineWidth = 2; c.strokeRect(pad, pad, W - pad * 2, photoH);
        // 网格
        c.strokeStyle = 'rgba(233,148,183,.18)'; c.lineWidth = 1;
        for (var gx = pad; gx < W - pad; gx += 22) { c.beginPath(); c.moveTo(gx, pad); c.lineTo(gx, pad + photoH); c.stroke(); }
        for (var gy = pad; gy < pad + photoH; gy += 22) { c.beginPath(); c.moveTo(pad, gy); c.lineTo(W - pad, gy); c.stroke(); }
        // 贴纸
        var crect = canvas.getBoundingClientRect();
        var sx = (W - pad * 2) / crect.width, sy = photoH / crect.height;
        Array.prototype.forEach.call(canvas.querySelectorAll('.placed'), function (p) {
          var px = parseFloat(p.style.left) || 0, py = parseFloat(p.style.top) || 0;
          c.font = '34px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top';
          c.fillText(p.textContent, pad + px * sx, pad + py * sy);
        });
        c.fillStyle = '#E482A6'; c.font = 'italic 26px Georgia,serif'; c.textAlign = 'center';
        c.fillText('my decorate ♡', W / 2, pad + photoH + 46);
        c.fillStyle = '#927E8A'; c.font = '14px sans-serif';
        c.fillText('PORTFOLIO JOURNAL · 2026', W / 2, H - 40);
        var a = document.createElement('a');
        a.download = 'my-sticker-polaroid.png'; a.href = cv.toDataURL('image/png'); a.click();
        toast('拍立得已保存 ✿');
      } catch (err) { toast('保存失败，请重试'); }
    });
  }

  /* ---------- 工具 ---------- */
  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 2200);
  }
  $('helpBtn').addEventListener('click', function () { toast('点击书页边缘或按 ← → 翻页 · 点击作品放大 · 侧边标签跳章节'); });
  $('soundBtn').addEventListener('click', function () { toast('装饰音效将在后续版本加入 ♫'); });

  // 初始隐藏翻页层
  flip.hidden = true;

  // URL 深链：#open 打开；#pageN 直达第 N 跨页（从 1 开始）
  (function applyHash() {
    var h = location.hash || '';
    var m = h.match(/^#page(\d+)$/);
    if (h === '#open' || m) {
      setTimeout(function () {
        openBook();
        if (m) {
          var n = Math.max(0, Math.min(SPREADS.length - 1, parseInt(m[1], 10) - 1));
          setTimeout(function () { index = n; renderStatic(n); updateUI(); }, 750);
        }
      }, 100);
    }
  })();
})();
