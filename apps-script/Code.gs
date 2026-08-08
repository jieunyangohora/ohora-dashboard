// ============================================================
//  오호라 콘텐츠 대시보드 - GAS 백엔드 v5
//  변경사항: PropertiesService 판매맵 캐시(12h), CAT_MAP 보완,
//            mergeList 빈배열일 때 기존 데이터 보존 안전장치(주석용 참고)
// ============================================================

var SS_ID = '1r1yUxPxvyvZILVhUI0YRamK3Ue0GAHERkerbY5uczLk';
var SS;
function getS() { if (!SS) SS = SpreadsheetApp.openById(SS_ID); return SS; }

var SHEET_KR_FEED   = 'KR_게시물';
var SHEET_US_FEED   = 'US_게시물';
var SALES_SHEET_NAME= '[import] APEX';
var DAILY_SHEET_NAME= '계정_일별';

var KR_SALES_SS_ID  = '1J5Z0aIP9Tz98hmyhlRbHLhVfqn2CzIAa95EDJgX-5aM';
var KR_SALES_TABS   = ['자사몰', '올리브영'];
var US_SALES_SS_ID  = '1YAIfB_6DbQq-ikDi5zZP6hNsgTCxluSXe3dOnl3g7yA';
var US_SALES_TAB    = '2025 RAW US';

// 통합 판매 데이터 시트 (KR+US 리스트 형식)
var UNIFIED_SALES_SS_ID = '18TPD6LEYL4xCCKMu8NrlJl3Y3JzIBTdHhonPdmp7CYA';
var UNIFIED_DAILY_TAB   = '통합_일별';

var GROWTH_KR_GID   = 1886661655;
var GROWTH_US_GID   = 1633278706;
var SNS_KR_GID      = 1585282698;
var SNS_US_GID      = 386344855;

var CAT_MAP = {
  // 한국어
  '젤스트립'           : 'gelStrip',
  '젤프레스온'         : 'gelPressOn',
  '프레스온'           : 'gelPressOn',
  '리얼젤팁'           : 'gelPressOn',
  '젤프레스온/리얼젤팁': 'gelPressOn',
  '강화제'             : 'hardener',
  '기타 케어류'        : 'otherCare',
  '기타케어류'         : 'otherCare',
  '기타 케어'          : 'otherCare',
  // 영어 제품군 컬럼값
  'strengthener'       : 'hardener',
  'Strengthener'       : 'hardener',
  'strip'              : 'gelStrip',
  'Strip'              : 'gelStrip',
  'Gel Strip'          : 'gelStrip',
  'gel strip'          : 'gelStrip',
  'Press On'           : 'gelPressOn',
  'Press-On'           : 'gelPressOn',
  'Press on'           : 'gelPressOn',
  'press on'           : 'gelPressOn',
  'presson'            : 'gelPressOn',
  'Presson'            : 'gelPressOn',
  'Hardener'           : 'hardener',
  'hardener'           : 'hardener',
  // 영어 (US 시트용)
  'Nail'               : 'gelStrip',
  'Pedi'               : 'gelStrip',
  '케어&툴'            : 'otherCare',
  'Care & Tool'        : 'otherCare',
  'Other Care'         : 'otherCare',
  'other care'         : 'otherCare',
  '케어류'             : 'otherCare',
  '케어'               : 'otherCare',
  '툴'                 : 'otherCare',
  '기타'               : 'otherCare',
  'Care&Tool'          : 'otherCare',
  'care&tool'          : 'otherCare',
  'Tool'               : 'otherCare',
  'tool'               : 'otherCare'
};

var SALES_ROW_LABELS_NORM = ['실적(ea)', '달성(ea)'];
function normLabel(v) { return String(v || '').replace(/\s/g, '').replace(/（/g, '(').replace(/）/g, ')').toLowerCase(); }
function isSalesLabel(v) { return SALES_ROW_LABELS_NORM.indexOf(normLabel(v)) >= 0; }
var COUNTRY_MAP = { 'KR':'KR','한국':'KR','국내':'KR','US':'US','미국':'US','미주':'US','JP':null,'일본':null };

// ============================================================
// PropertiesService 캐시 헬퍼
// ============================================================
var CACHE_TTL_MS = 12 * 3600 * 1000; // 12시간

function saveCachedSales(krMap, usMap) {
  try {
    var data = JSON.stringify({kr: krMap, us: usMap});
    var fname = 'ohora_sales_cache.json';
    var files = DriveApp.getFilesByName(fname);
    if (files.hasNext()) {
      files.next().setContent(data);
    } else {
      DriveApp.createFile(fname, data, MimeType.PLAIN_TEXT);
    }
    PropertiesService.getScriptProperties().setProperty('sales_ts', String(Date.now()));
    Logger.log('saveCachedSales: saved ' + Math.round(data.length/1024) + 'KB to Drive');
  } catch(e) { Logger.log('saveCachedSales error: ' + e); throw e; }
}

function loadCachedSales() {
  try {
    var props = PropertiesService.getScriptProperties();
    var ts = Number(props.getProperty('sales_ts') || '0');
    if (!ts || Date.now() - ts > CACHE_TTL_MS) return null; // 캐시 만료
    var files = DriveApp.getFilesByName('ohora_sales_cache.json');
    if (!files.hasNext()) return null;
    var data = JSON.parse(files.next().getBlob().getDataAsString());
    if (!data.kr || !data.us) return null;
    return {kr: data.kr, us: data.us};
  } catch(e) { Logger.log('loadCachedSales error: ' + e); return null; }
}

// ============================================================
// doGet
// ============================================================
function doGet(e) {
  try {
    var param = (e && e.parameter && e.parameter.type) || '';

    if (param === 'debugApex') {
      var dbSheet = getS().getSheetByName(SALES_SHEET_NAME);
      var dbInfo = { sheetFound: !!dbSheet, structure: [] };
      if (dbSheet) {
        var ar = dbSheet.getRange(1,1,Math.min(dbSheet.getLastRow(),8),Math.min(5,dbSheet.getLastColumn())).getValues();
        for (var r = 0; r < ar.length; r++) {
          var s = [];
          for (var c = 0; c < ar[r].length; c++) { var cell = ar[r][c]; if (cell !== '' && cell !== null && cell !== 0) s.push('c'+c+':'+(cell instanceof Date?'DATE':String(cell))); }
          if (s.length) dbInfo.structure.push('r'+r+' | '+s.join(' | '));
        }
      }
      return json(dbInfo);
    }

    if (param === 'debugAccount') return json(buildAccountMetrics());
    if (param === 'debugMonthly') return json(debugMonthlySheet_());
    if (param === 'debugTargets') return json(buildMonthlyTargets());
    if (param === 'debugSheets') return json(debugSheets_());
    if (param === 'debugWeek') return json(debugWeekSheet_());

    // US 게시물 시트 컬럼 위치 확인 (product type/code/name 헤더가 어디 있는지)
    if (param === 'debugUSColumns') {
      var sh = getS().getSheetByName(SHEET_US_FEED);
      if (!sh) return json({ error: 'US_게시물 시트 없음' });
      var lastCol = sh.getLastColumn();
      var scanFrom = 35, scanCols = Math.min(lastCol - scanFrom + 1, 40);
      if (scanCols <= 0) return json({ error: '컬럼 부족', lastCol: lastCol });
      var rows = sh.getRange(1, scanFrom, Math.min(2, sh.getLastRow()), scanCols).getValues();
      var found = { lastCol: lastCol, headers: {} };
      rows.forEach(function(row, ri) {
        row.forEach(function(h, ci) {
          if (!h) return;
          found.headers['r' + (ri+1) + '_c' + (scanFrom+ci)] = String(h);
        });
      });
      return json(found);
    }

    // 통합_일별 US 행의 구분2 값 목록 + 날짜 범위 (CAT_MAP 매칭 여부 확인용)
    if (param === 'debugUnifiedUS') {
      var ss2 = SpreadsheetApp.openById(UNIFIED_SALES_SS_ID);
      var sh2 = ss2.getSheetByName(UNIFIED_DAILY_TAB);
      if (!sh2) return json({ error: '통합_일별 없음' });
      var data2 = sh2.getRange(1, 1, Math.min(sh2.getLastRow(), 50000), 10).getValues();
      var cat2Vals = {}, dateMin = '', dateMax = '', usCnt = 0, tz2 = Session.getScriptTimeZone();
      for (var i2 = 1; i2 < data2.length; i2++) {
        if (String(data2[i2][1]||'').trim() !== '미국') continue;
        usCnt++;
        var cat2 = String(data2[i2][6]||'').trim();
        cat2Vals[cat2] = (cat2Vals[cat2] || 0) + 1;
        var dv2 = data2[i2][0];
        var ds2 = (dv2 instanceof Date) ? Utilities.formatDate(dv2, tz2, 'yyyy-MM-dd') : String(dv2||'').slice(0,10);
        if (ds2 && ds2.length >= 10) {
          if (!dateMin || ds2 < dateMin) dateMin = ds2;
          if (!dateMax || ds2 > dateMax) dateMax = ds2;
        }
      }
      var matchResult = {};
      Object.keys(cat2Vals).forEach(function(v) {
        matchResult[v] = { count: cat2Vals[v], catKey: CAT_MAP[v] || '❌ 매핑 없음' };
      });
      return json({ usTotalRows: usCnt, dateRange: { min: dateMin, max: dateMax }, cat2Mapping: matchResult });
    }

    // US 판매 맵 날짜 범위 + US_게시물 최근 콘텐츠 productType 확인
    if (param === 'debugUSFull') {
      // 1) US byCat 날짜 범위
      var cached2 = loadCachedSales();
      var usMap2 = cached2 ? cached2.us : buildUnifiedSalesMap('US');
      var catDateRange = {};
      Object.keys(usMap2.byCat || {}).forEach(function(ck) {
        var dates = Object.keys(usMap2.byCat[ck]).sort();
        catDateRange[ck] = { min: dates[0], max: dates[dates.length-1], count: dates.length };
      });
      // 2) US_게시물 최근 20개 행의 productType 확인 (lastCol 포함)
      var sh3 = getS().getSheetByName(SHEET_US_FEED);
      var sampleItems = [];
      if (sh3 && sh3.getLastRow() >= 3) {
        var lc3 = sh3.getLastColumn();
        var sRows = Math.min(20, sh3.getLastRow()-2);
        var sData = sh3.getRange(sh3.getLastRow()-sRows, 1, sRows, lc3).getValues();
        var tCol=-1, cCol=-1;
        var pStart = 49; // getFeedBySheet와 동일한 productColStart
        var hh = sh3.getRange(1, pStart, 2, Math.max(1, lc3-pStart+1)).getValues();
        hh.forEach(function(hr) { hr.forEach(function(h,ci) {
          if (!h) return;
          var hs = String(h).replace(/\s/g,'');
          var absIdx = pStart - 1 + ci;
          if ((hs.includes('타입')||hs.toLowerCase().includes('type')) && tCol<0) tCol=absIdx;
          if ((hs.includes('코드')||hs.toLowerCase().includes('code')) && cCol<0) cCol=absIdx;
        }); });
        sData.forEach(function(row) {
          var dt = row[0]; if (!dt) return;
          var ds3 = (dt instanceof Date) ? Utilities.formatDate(dt, Session.getScriptTimeZone(),'yyyy-MM-dd') : String(dt).slice(0,10);
          sampleItems.push({ date: ds3, productType: tCol>=0?String(row[tCol]||''):'?', productCode: cCol>=0?String(row[cCol]||''):'?' });
        });
      }
      return json({ usByCatDates: catDateRange, recentUSContent: sampleItems });
    }

    if (param === 'debugSalesMap') {
      var cached = loadCachedSales();
      var kr, us;
      if (cached) { kr = cached.kr; us = cached.us; }
      else { kr = buildUnifiedSalesMap('KR'); us = buildUnifiedSalesMap('US'); saveCachedSales(kr, us); }
      function summ(m) {
        var codes = Object.keys(m.byCode || {});
        return { codeCount: codes.length, sampleCodes: codes.slice(0,5), catKeys: Object.keys(m.byCat || {}), sampleDates: codes.length ? Object.keys(m.byCode[codes[0]]).slice(0,3) : [], cached: !!cached };
      }
      return json({ kr: summ(kr), us: summ(us) });
    }

    if (param === 'debugKR') {
      var ss = SpreadsheetApp.openById(KR_SALES_SS_ID);
      var info = {};
      KR_SALES_TABS.forEach(function(tab) {
        var sh = ss.getSheetByName(tab);
        info[tab] = sh ? { lastRow: sh.getLastRow(), lastCol: sh.getLastColumn(), sample: sh.getRange(1,1,Math.min(5,sh.getLastRow()),Math.min(6,sh.getLastColumn())).getValues() } : 'not found';
      });
      return json(info);
    }

    // 캐시 강제 초기화 후 재빌드 (시트 1회 읽기로 KR+US 동시 구축)
    if (param === 'refreshSales') {
      var both = buildUnifiedSalesMapBoth();
      saveCachedSales(both.kr, both.us);
      return json({ ok: true, krCodes: Object.keys(both.kr.byCode||{}).length, usCodes: Object.keys(both.us.byCode||{}).length });
    }

    if (param === 'debugCache') {
      var props = PropertiesService.getScriptProperties();
      var ts = Number(props.getProperty('sales_ts') || '0');
      var ageMin = ts ? Math.round((Date.now()-ts)/60000) : null;
      return json({ hasSalesCache: !!ts, ageMinutes: ageMin, expired: !ts || Date.now()-ts > CACHE_TTL_MS });
    }

    if (param === 'fillDailyData') {
      // 7/15~7/28 KR/US 일별 데이터 채우기 (도달이 0인 행만 업데이트)
      var FILL_DATA = [
        ['2026-07-15','KR',0,1128679,7452,6717,30562],
        ['2026-07-16','KR',0,1080553,7412,6824,38346],
        ['2026-07-17','KR',0,843681,7060,6324,29104],
        ['2026-07-18','KR',0,1073027,8184,8653,29096],
        ['2026-07-19','KR',0,860854,6998,6688,35799],
        ['2026-07-20','KR',0,755701,6797,6797,22280],
        ['2026-07-21','KR',0,674205,5857,5241,22840],
        ['2026-07-22','KR',0,729427,8926,5427,23311],
        ['2026-07-23','KR',0,840210,11183,6904,21116],
        ['2026-07-24','KR',0,804784,7906,6065,24179],
        ['2026-07-25','KR',0,870376,7005,6286,25522],
        ['2026-07-26','KR',0,927552,6827,5867,26494],
        ['2026-07-27','KR',0,660380,5974,4898,21572],
        ['2026-07-28','KR',0,743136,5863,4879,21978],
        ['2026-07-15','US',0,298457,25565,3283,7377],
        ['2026-07-16','US',0,322680,23782,3120,8498],
        ['2026-07-17','US',0,603274,31032,3402,8542],
        ['2026-07-18','US',0,478615,27740,3474,8828],
        ['2026-07-19','US',0,891528,38708,4276,9579],
        ['2026-07-20','US',0,1649413,77552,3479,8244],
        ['2026-07-21','US',0,623801,32295,2988,7835],
        ['2026-07-22','US',0,531764,24815,2332,6150],
        ['2026-07-23','US',0,684095,30448,2386,4963],
        ['2026-07-24','US',0,1837155,100269,3347,5231],
        ['2026-07-25','US',0,484987,26620,1903,5296],
        ['2026-07-26','US',0,881776,30854,2589,6526],
        ['2026-07-27','US',0,374746,18767,2061,5825],
        ['2026-07-28','US',0,282274,17862,1586,5605]
      ];
      var sh = getS().getSheetByName(DAILY_SHEET_NAME);
      if (!sh) return json({ok:false, error:'계정_일별 시트 없음'});
      var lastRow = sh.getLastRow();
      var existing = sh.getRange(2, 1, lastRow - 1, 7).getValues();
      var tz = Session.getScriptTimeZone();
      var rowMap = {};
      existing.forEach(function(row, i) {
        var dv = row[0];
        var ds = (dv instanceof Date) ? Utilities.formatDate(dv, tz, 'yyyy-MM-dd') : String(dv).trim().slice(0,10);
        var acct = String(row[1]).trim().toUpperCase();
        if (ds && acct) rowMap[ds + '_' + acct] = i + 2;
      });
      var updated = 0, appended = 0;
      FILL_DATA.forEach(function(d) {
        var key = d[0] + '_' + d[1];
        if (rowMap[key]) {
          var rowNum = rowMap[key];
          var cur = sh.getRange(rowNum, 4).getValue();
          if (!cur || Number(cur) === 0) {
            sh.getRange(rowNum, 1, 1, 7).setValues([d]);
            updated++;
          }
        } else {
          sh.appendRow(d);
          appended++;
        }
      });
      return json({ok:true, updated:updated, appended:appended});
    }

    // ── AI 요약 로드 (시트에서) ────────────────────────────────
    if (param === 'getAiSummary') {
      var gaCountry = (e && e.parameter && e.parameter.country) || 'KR';
      var gaWeek = (e && e.parameter && e.parameter.week) || '';
      var saved = loadSavedAiSummary(gaCountry, gaWeek);
      return json({ ok: true, summary: saved || null });
    }

    // ── AI 요약 생성 (Claude API → 시트 저장) ─────────────────
    if (param === 'aiSummary') {
      var aiCountry = (e && e.parameter && e.parameter.country) || 'KR';
      var aiWeek = (e && e.parameter && e.parameter.week) || '';
      var amAll = buildAccountMetrics();
      var aiMetrics = (amAll[aiCountry] && amAll[aiCountry][aiWeek]) || {};
      var aiSheetName = aiCountry === 'KR' ? SHEET_KR_FEED : SHEET_US_FEED;
      var aiColStart  = aiCountry === 'KR' ? 48 : 49;
      var aiItems = [], aiTrend = [], aiMeta = { totalPublished: 0, excludedFeed: 0 };
      try {
        var aiCached = loadCachedSales();
        var aiSalesMap = (aiCached && aiCached[aiCountry.toLowerCase()]) || {byCode:{},byCat:{}};
        var aiBoth = getFeedBySheet(aiSheetName, 'BOTH', aiSalesMap, aiColStart); // {all:{주차:[...]}, feed:{...}}
        var aiWeekItems = (aiBoth && aiBoth.all && aiBoth.all[aiWeek]) || [];
        // 피드는 브랜딩 목적이라 성과 낮음 → 성과분석에서 제외. 단, 릴스 도달 중앙값 이상인 "확실한 고성과 피드"만 포함.
        var reels = aiWeekItems.filter(function(it){ return it.isReel; });
        var feeds = aiWeekItems.filter(function(it){ return !it.isReel; });
        var median = function(a){ if(!a.length) return 0; var s=a.slice().sort(function(x,y){return x-y;}); var m=Math.floor(s.length/2); return s.length%2?s[m]:(s[m-1]+s[m])/2; };
        var reelMed = median(reels.map(function(it){ return Number(it.reach)||0; }));
        var thresh = reelMed > 0 ? reelMed : median(aiWeekItems.map(function(it){ return Number(it.reach)||0; }));
        var goodFeeds = feeds.filter(function(it){ return thresh > 0 && (Number(it.reach)||0) >= thresh; });
        var analysisItems = reels.concat(goodFeeds);
        if (!analysisItems.length) analysisItems = aiWeekItems; // 안전장치(릴스·고성과피드 전무 시 전량)
        aiItems = analysisItems.sort(function(a,b){ return (Number(b.reach||0)+Number(b.engagement||0))-(Number(a.reach||0)+Number(a.engagement||0)); });
        aiMeta = { totalPublished: aiWeekItems.length, excludedFeed: feeds.length - goodFeeds.length };
        // 최근 6주 추이 (선택 주차 이하, 주차번호순 마지막 6개)
        var selN = weekNum(aiWeek);
        var wkList = Object.keys((amAll[aiCountry]||{})).filter(function(w){ return weekNum(w) <= selN; }).sort(function(a,b){ return weekNum(a)-weekNum(b); }).slice(-6);
        aiTrend = wkList.map(function(wk){
          var mm = amAll[aiCountry][wk] || {};
          var cnt = (aiBoth && aiBoth.all && aiBoth.all[wk] || []).length;
          return { week: wk, views: mm.views||0, sales: mm.sales||0, inflow: mm.inflow||0, itemCount: cnt };
        });
      } catch(e2) { Logger.log('aiSummary items/trend error: '+e2); }
      return json(generateAiSummary(aiCountry, aiWeek, aiMetrics, aiItems, aiTrend, aiMeta));
    }

    // ── AI 통합 브리핑 (KR+US 종합, country='GLOBAL'로 저장) ──
    if (param === 'aiGlobalSummary') {
      var gWeek = (e && e.parameter && e.parameter.week) || '';
      return json(generateGlobalAiSummary(gWeek));
    }

    // ── 메인 type=all ──────────────────────────────────────
    var cached = loadCachedSales();
    var krSalesMap, usSalesMap;
    if (cached) {
      krSalesMap = cached.kr;
      usSalesMap = cached.us;
    } else {
      krSalesMap = buildUnifiedSalesMap('KR');
      usSalesMap = buildUnifiedSalesMap('US');
      saveCachedSales(krSalesMap, usSalesMap);
    }

    var result = {
      ok: true,
      feedContents:    { KR:{}, US:{} },
      allContents:     { KR:{}, US:{} },
      weeklySalesCount:{ KR:{}, US:{} },
      dailyMetrics:    { KR:[], US:[] },
      accountMetrics:  { KR:{}, US:{} },
      weekMeta: [],
      salesCached: !!cached
    };

    var krBoth = getFeedBySheet(SHEET_KR_FEED, 'BOTH', krSalesMap, 48);
    var usBoth = getFeedBySheet(SHEET_US_FEED, 'BOTH', usSalesMap, 49);
    result.feedContents.KR = krBoth.feed;
    result.feedContents.US = usBoth.feed;
    result.allContents.KR  = krBoth.all;
    result.allContents.US  = usBoth.all;

    result.weeklySalesCount = getWeeklySalesCount();
    result.dailyMetrics     = buildDailyMetrics(krSalesMap, usSalesMap);
    result.accountMetrics   = buildAccountMetrics();
    result.monthlyTargets   = buildMonthlyTargets();

    var allWeeks = {};
    ['KR','US'].forEach(function(c) {
      Object.keys(result.feedContents[c]).forEach(function(wk){ allWeeks[wk]=true; });
      Object.keys(result.allContents[c]).forEach(function(wk){ allWeeks[wk]=true; });
    });
    result.weekMeta = Object.keys(allWeeks).sort(function(a,b){ return weekNum(a)-weekNum(b); }).map(function(wk){ return {key:wk, month:weekToMonth(wk)}; });

    // 제품군별 주간 판매건수 (콘텐츠 발행 여부 무관, byCat 원본 합산)
    var _tz = Session.getScriptTimeZone(); var CAT_KEYS = ['gelStrip','gelPressOn','hardener','otherCare'];
    result.weeklyCatSales = {KR:{},US:{}};
    ['KR','US'].forEach(function(c){
      var salesMap = c==='KR' ? krSalesMap : usSalesMap;
      result.weekMeta.forEach(function(wm){
        result.weeklyCatSales[c][wm.key] = {};
        var dates = getWeekDates(wm.key, _tz);
        CAT_KEYS.forEach(function(ck){
          var total=0;
          if(salesMap && salesMap.byCat && salesMap.byCat[ck]){
            dates.forEach(function(ds){ total += (salesMap.byCat[ck][ds]||0); });
          }
          result.weeklyCatSales[c][wm.key][ck] = total;
        });
      });
    });

    var analysisMap = getAnalysisMap();
    ['KR','US'].forEach(function(c) {
      var salesMap = c==='KR' ? krSalesMap : usSalesMap;
      ['allContents','feedContents'].forEach(function(key) {
        Object.keys(result[key][c]).forEach(function(wk) {
          result[key][c][wk] = result[key][c][wk].map(function(item) {
            var a = item.link ? analysisMap[item.link] : null;
            if (a) {
              if (a.hypothesis)  item.hypothesis  = a.hypothesis;
              if (a.analysis)    item.analysis    = a.analysis;
              if (a.salesReview) item.salesReview = a.salesReview;
              if (a.formatRepeat) item.formatRepeat = a.formatRepeat;
              if (a.isLoop)      item.isLoop      = a.isLoop;
              if (a.loopLink)    item.loopLink    = a.loopLink;
              if (a.loopTitle)   item.loopTitle   = a.loopTitle;
              if (a.salesConversion) item.salesConversion = a.salesConversion;
              if (a.productCode && !item.productCode) {
                item.productCode = a.productCode;
                item.productName = a.productName || '';
                if (item.publishDate) {
                  if (salesMap.byCode) item.salesProd = liftWindows(salesMap.byCode, a.productCode, item.publishDate);
                  var ckA = CAT_MAP[item.productType] || '';
                  if (ckA && salesMap.byCat) item.salesCat = liftWindows(salesMap.byCat, ckA, item.publishDate);
                }
              }
            }
            return item;
          });
        });
      });
    });

    return json(result);
  } catch(err) {
    return json({ ok: false, error: err.toString() });
  }
}

function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// ============================================================
// getFeedBySheet
// ============================================================
function getFeedBySheet(sheetName, mode, salesMap, productColStart) {
  var sheet = getS().getSheetByName(sheetName);
  if (!sheet) return {};
  var lastRow = sheet.getLastRow();
  if (lastRow < 3) return {};
  var lastCol = Math.max(sheet.getLastColumn(), productColStart ? productColStart + 5 : 11);
  var typeCol=-1, codeCol=-1, nameCol=-1;
  if (productColStart && productColStart <= lastCol) {
    try {
      var hRows = sheet.getRange(1, productColStart, Math.min(2,lastRow), lastCol-productColStart+1).getValues();
      hRows.forEach(function(hRow) {
        hRow.forEach(function(h,ci) {
          if (!h) return;
          var hs = String(h).replace(/\s/g,'');
          var absIdx = productColStart - 1 + ci;
          if ((hs.includes('타입')||hs.toLowerCase().includes('type')) && typeCol<0) typeCol=absIdx;
          else if ((hs.includes('코드')||hs.toLowerCase().includes('code')) && codeCol<0) codeCol=absIdx;
          else if ((hs.includes('명')||hs.toLowerCase().includes('name')) && nameCol<0) nameCol=absIdx;
        });
      });
    } catch(e){}
  }
  var data = sheet.getRange(3, 1, lastRow-2, lastCol).getValues();
  // BOTH 모드: {all:{}, feed:{}} 동시 반환 (시트 중복 읽기 방지)
  var isBoth = (mode === 'BOTH');
  var byWeek = {}, byWeekFeed = {}, thisYear = new Date().getFullYear(), tz = Session.getScriptTimeZone();

  // 코드→정식이름 사전: 코드 컬럼/이름 컬럼은 개수·순서가 안 맞을 때가 많아 위치매핑은 불안정.
  // 단일 제품(또는 개수 일치) 행에서 신뢰 가능한 매핑만 모아 코드별 정식 이름을 확정한다.
  var codeNameMap = {};
  if (codeCol >= 0 && nameCol >= 0) {
    data.forEach(function(row) {
      var cs = String(row[codeCol]||'').split(/[,、]/).map(function(s){return s.trim();}).filter(Boolean);
      var ns = String(row[nameCol]||'').split(/[,、]/).map(function(s){return s.trim();}).filter(Boolean);
      if (cs.length === 1 && ns.length === 1) { if (!codeNameMap[cs[0]]) codeNameMap[cs[0]] = ns[0]; }
      else if (cs.length > 1 && cs.length === ns.length) { cs.forEach(function(c,i){ if(!codeNameMap[c]) codeNameMap[c]=ns[i]; }); }
    });
  }

  data.forEach(function(row) {
    var publishDate = row[0];
    var type        = String(row[1]||'').trim();
    var caption     = String(row[2]||'').trim();
    var url         = String(row[3]||'').trim();
    if (!publishDate) return;
    if (mode==='IMAGE_ONLY' && type!=='CAROUSEL_ALBUM' && type!=='IMAGE') return;
    var dateObj = (publishDate instanceof Date) ? publishDate : new Date(publishDate);
    if (isNaN(dateObj.getTime()) || dateObj.getFullYear()!==thisYear) return;
    var weekKey  = getISOWeekKey(dateObj);
    var dateStr  = Utilities.formatDate(dateObj, tz, 'yyyy-MM-dd');
    var productType = typeCol>=0 ? String(row[typeCol]||'').trim() : '';
    var productCode = codeCol>=0 ? String(row[codeCol]||'').trim() : '';
    var productName = nameCol>=0 ? String(row[nameCol]||'').trim() : '';
    var item = {
      publishDate: dateStr,
      title:       caption.substring(0,60),
      link:        url,
      isReel:      /\/reel[s]?\//i.test(url) || type==='VIDEO',
      likes:       toNum(row[4]),  comments:    toNum(row[5]),
      saves:       toNum(row[6]),  shares:      toNum(row[7]),
      reach:       toNum(row[8]),  views:       toNum(row[9]),
      engagement:  toNum(row[10]),
      productType: productType,
      productCode: productCode,
      productName: productName,
      productNames: productName ? [productName] : []
    };
    item.snap = {
      init: { reach:toNum(row[15]), views:toNum(row[16]), engagement:toNum(row[17]) },
      w1:   { reach:toNum(row[22]), views:toNum(row[23]), engagement:toNum(row[24]) },
      w2:   { reach:toNum(row[29]), views:toNum(row[30]), engagement:toNum(row[31]) },
      w3:   { reach:toNum(row[36]), views:toNum(row[37]), engagement:toNum(row[38]) },
      w4:   { reach:toNum(row[43]), views:toNum(row[44]), engagement:toNum(row[45]) }
    };
    if (salesMap) {
      if (productCode && salesMap.byCode) {
        // 멀티 제품(콤마/、 구분): 제품별로 각각 판매전환 계산 (하이픈은 코드 일부이므로 분리 안 함)
        var _codesRaw = productCode.split(/[,、]/).map(function(s){ return s.trim(); }).filter(Boolean);
        var _names = String(productName||'').split(/[,、]/).map(function(s){ return s.trim(); }).filter(Boolean);
        // 코드 중복 제거(같은 SKU 두 번 방지)
        var _codes = _codesRaw.filter(function(c, i){ return _codesRaw.indexOf(c) === i; });
        var _pairable = (_names.length === _codes.length); // 개수 일치 시에만 위치매핑 보조 사용
        if (_codes.length > 1) {
          // 이름은 코드→정식이름 사전 우선, 없으면 개수 일치 시 위치매핑, 그래도 없으면 공란(코드만 표시)
          item.salesProdList = _codes.map(function(c, ci){
            var nm = codeNameMap[c] || (_pairable ? (_names[ci] || '') : '');
            return { code: c, name: nm, lift: liftWindows(salesMap.byCode, c, dateStr) };
          });
          item.salesProd = liftWindows(salesMap.byCode, _codes[0], dateStr); // 대표(첫 제품) — 정렬·등급 호환
        } else {
          item.salesProd = liftWindows(salesMap.byCode, _codes[0] || productCode, dateStr);
        }
      }
      var catKey = CAT_MAP[productType] || '';
      if (catKey && salesMap.byCat) item.salesCat = liftWindows(salesMap.byCat, catKey, dateStr);
    }
    if (!byWeek[weekKey]) byWeek[weekKey] = [];
    byWeek[weekKey].push(item);
    if (isBoth && (type==='CAROUSEL_ALBUM' || type==='IMAGE')) {
      if (!byWeekFeed[weekKey]) byWeekFeed[weekKey] = [];
      byWeekFeed[weekKey].push(item);
    }
  });
  if (isBoth) return {all: byWeek, feed: byWeekFeed};
  return byWeek;
}

// ============================================================
// getWeeklySalesCount ([import] APEX 시트)
// ============================================================
function isApexDate(cell) { if(cell instanceof Date && !isNaN(cell.getTime())) return true; return /^\d{4}\.\s*\d{1,2}\.\s*\d{1,2}/.test(String(cell||'').trim()); }
function parseApexDate(cell) { if(cell instanceof Date && !isNaN(cell.getTime())) return cell; var m=String(cell||'').trim().match(/^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/); return m?new Date(parseInt(m[1]),parseInt(m[2])-1,parseInt(m[3])):null; }

function getWeeklySalesCount() {
  var salesSheet = getS().getSheetByName(SALES_SHEET_NAME);
  if (!salesSheet) return { KR:{}, US:{} };
  var lastRow=salesSheet.getLastRow(), lastCol=salesSheet.getLastColumn();
  if (lastRow<2||lastCol<3) return { KR:{}, US:{} };
  var allData = salesSheet.getRange(1,1,Math.min(lastRow,600),lastCol).getValues();
  var dateRowIdx=-1, dateStartCol=-1;
  for (var r=0;r<Math.min(20,allData.length);r++) {
    var run=0,fr=-1;
    for (var c=0;c<allData[r].length;c++) { if(isApexDate(allData[r][c])){ if(run===0)fr=c; run++; if(run>=5){dateRowIdx=r;dateStartCol=fr;break;} } else {run=0;fr=-1;} }
    if (dateRowIdx>=0) break;
  }
  if (dateRowIdx<0||dateStartCol<0) return { KR:{}, US:{} };
  var colWeekMap={};
  for (var c=dateStartCol;c<allData[dateRowIdx].length;c++) { var d=parseApexDate(allData[dateRowIdx][c]); if(d) colWeekMap[c]=getISOWeekKey(d); }
  var result={KR:{},US:{}}, cc='', cat='';
  for (var r=dateRowIdx+1;r<allData.length;r++) {
    var row=allData[r];
    for (var c=0;c<dateStartCol;c++) {
      var cv=String(row[c]||'').trim(); if(!cv) continue;
      var up=cv.toUpperCase();
      if (up in COUNTRY_MAP) { cc=COUNTRY_MAP[up]!==null?COUNTRY_MAP[up]:'__SKIP__'; continue; }
      if (CAT_MAP[cv]) { cat=cv; continue; }
    }
    if (!cc||cc==='__SKIP__'||!result[cc]||!cat||!CAT_MAP[cat]) continue;
    var catKey=CAT_MAP[cat], isSales=false;
    for (var c=0;c<dateStartCol;c++) { if(isSalesLabel(row[c])){isSales=true;break;} }
    if (!isSales) continue;
    for (var c=dateStartCol;c<row.length;c++) { var wk=colWeekMap[c]; if(!wk) continue; var v=toNum(row[c]); if(!v) continue; if(!result[cc][wk])result[cc][wk]={}; result[cc][wk][catKey]=(result[cc][wk][catKey]||0)+v; }
  }
  return result;
}

// ============================================================
// buildDailyMetrics (계정_일별 + 판매맵 일별 합계)
// ============================================================
function buildDailyMetrics(krSalesMap, usSalesMap) {
  var out={KR:[],US:[]}, sheet=getS().getSheetByName(DAILY_SHEET_NAME);
  if (!sheet||sheet.getLastRow()<2) return out;
  var tz=Session.getScriptTimeZone(), cutoff=new Date(); cutoff.setDate(cutoff.getDate()-30);
  var data=sheet.getRange(2,1,sheet.getLastRow()-1,Math.max(sheet.getLastColumn(),7)).getValues();
  function dailyTotals(m) { var t={}; if(m&&m.byCode){ Object.keys(m.byCode).forEach(function(code){ var dm=m.byCode[code]; Object.keys(dm).forEach(function(ds){ t[ds]=(t[ds]||0)+dm[ds]; }); }); } return t; }
  var krT=dailyTotals(krSalesMap), usT=dailyTotals(usSalesMap);
  var tmp={KR:[],US:[]};
  data.forEach(function(row) {
    var acct=String(row[1]||'').trim().toUpperCase(); if(acct!=='KR'&&acct!=='US') return;
    var dv=row[0], dateObj=(dv instanceof Date)?dv:new Date(String(dv)); if(isNaN(dateObj.getTime())||dateObj<cutoff) return;
    var ds=Utilities.formatDate(dateObj,tz,'yyyy-MM-dd');
    tmp[acct].push({ _raw_date:ds, date:Utilities.formatDate(dateObj,tz,'M/d'),
      reach:toNum(row[3]), engagement:toNum(row[4]), profileVisits:toNum(row[5]), websiteClicks:toNum(row[6]),
      followers:toNum(row[2]), sales:(acct==='KR'?krT[ds]:usT[ds])||0, views:0, inflow:0 });
  });
  ['KR','US'].forEach(function(c){ tmp[c].sort(function(a,b){return a._raw_date<b._raw_date?-1:1;}); out[c]=tmp[c]; });
  return out;
}

// ============================================================
// buildAccountMetrics (그로스_KR/US + SNS daily)
// ============================================================
function pctNum(v) { var n=Number(String(v||'').replace(/[,\s%]/g,'')); return isFinite(n)?n:0; }
var _SHEETS_CACHE = null;
function gidSheet(gid) { if(!_SHEETS_CACHE) _SHEETS_CACHE=getS().getSheets(); for(var i=0;i<_SHEETS_CACHE.length;i++){if(_SHEETS_CACHE[i].getSheetId()===gid)return _SHEETS_CACHE[i];} return null; }

// RAW_그로스_week 탭(가로 US/KR/JP 블록)에서 주간 달성/달성률 파싱
// - 주차 헤더(W25..) 연속 구간으로 블록 분리, 국가는 헤더의 US/KR/JP 라벨로 판별(JP 무시)
// - '달성률' 라벨이 매출/유입/전환율/객단가에 중복되므로 '목표/달성 XX' 행으로 섹션 컨텍스트 추적
function readWeeklyGrowth_(out) {
  var sh = getS().getSheetByName('RAW_그로스_week');
  if (!sh || sh.getLastRow() < 4) return;
  var lr = sh.getLastRow(), lc = sh.getLastColumn();
  var vals = sh.getRange(1, 1, Math.min(lr, 45), Math.min(lc, 60)).getValues();
  var WEEK_RE = /^W(\d+)$/;

  // 1) 주차 헤더행 (W?? 3개 이상)
  var headerRow = -1;
  for (var r = 0; r < Math.min(vals.length, 8); r++) {
    var cnt = 0;
    for (var c = 0; c < vals[r].length; c++) if (WEEK_RE.test(String(vals[r][c] || '').trim())) cnt++;
    if (cnt >= 3) { headerRow = r; break; }
  }
  if (headerRow < 0) return;

  // 2) 연속 주차 구간 → 블록
  var hdr = vals[headerRow], blocks = [], cur = null;
  for (var c2 = 0; c2 < hdr.length; c2++) {
    var m = String(hdr[c2] || '').trim().match(WEEK_RE);
    if (m) { if (!cur) { cur = { weekCols: {}, firstCol: c2 }; blocks.push(cur); } cur.weekCols[c2] = 'W' + parseInt(m[1]); }
    else cur = null;
  }
  blocks.forEach(function(b) {
    b.labelCol = b.firstCol - 1;
    b.lastCol = Math.max.apply(null, Object.keys(b.weekCols).map(Number));
  });

  // 3) 국가 판별: 헤더행 이상에서 블록 컬럼 범위의 US/KR/JP 텍스트
  function detectCountry(b) {
    for (var r = 0; r <= headerRow; r++) {
      for (var c = Math.max(0, b.firstCol - 2); c <= b.lastCol; c++) {
        var s = String(vals[r][c] || '').trim().toUpperCase();
        if (s === 'KR' || s.indexOf('_KR') >= 0 || s === '한국') return 'KR';
        if (s === 'US' || s.indexOf('_US') >= 0 || s === '미국') return 'US';
        if (s === 'JP' || s.indexOf('_JP') >= 0 || s === '일본') return 'JP';
      }
    }
    return null;
  }

  // 4) 라벨(주 컬럼에 가까운 쪽 우선) 읽기
  function labelAt(b, r) {
    for (var d = 0; d <= 2; d++) { var s = String(vals[r][b.labelCol - d] || '').trim(); if (s) return s; }
    return '';
  }

  blocks.forEach(function(b) {
    var country = detectCountry(b);
    if (country !== 'KR' && country !== 'US') return; // JP 등 무시
    if (!out[country]) out[country] = {};
    var ctx = null;
    for (var r = headerRow + 1; r < vals.length; r++) {
      var label = labelAt(b, r);
      if (!label) continue;
      // 섹션 컨텍스트 갱신
      if (/매출/.test(label)) ctx = 'sales';
      else if (/유입/.test(label)) ctx = 'inflow';
      else if (/전환율/.test(label)) ctx = 'conv';
      else if (/객단가/.test(label)) ctx = 'aov';
      else if (/조회수|콘텐츠\s*뷰|뷰/.test(label)) ctx = 'views';
      // 값 매핑 (달성/달성률만)
      var field = null;
      if (/^달성\s*매출/.test(label)) field = 'sales';
      else if (/^달성\s*유입/.test(label)) field = 'inflow';
      else if (/달성률/.test(label)) {
        if (ctx === 'sales') field = 'salesAchieveRate';
        else if (ctx === 'inflow') field = 'inflowAchieveRate';
        else if (ctx === 'views') field = 'viewsAchieveRate';
      }
      if (!field) continue;
      var isRate = field.indexOf('Rate') >= 0;
      Object.keys(b.weekCols).forEach(function(cs) {
        var cc = parseInt(cs), wk = b.weekCols[cc];
        if (!out[country][wk]) out[country][wk] = {};
        out[country][wk][field] = isRate ? pctNum(vals[r][cc]) : toNum(vals[r][cc]);
      });
    }
  });
}

function buildAccountMetrics() {
  var out={KR:{},US:{}}, yr=new Date().getFullYear();
  readWeeklyGrowth_(out);
  [['KR',SNS_KR_GID],['US',SNS_US_GID]].forEach(function(p) {
    var country=p[0], sh=gidSheet(p[1]); if(!sh||sh.getLastRow()<2) return;
    var vals=sh.getRange(1,1,sh.getLastRow(),Math.max(sh.getLastColumn(),20)).getValues();
    vals.forEach(function(row) {
      var wk=String(row[2]||'').trim(); if(!/^W\d+$/.test(wk)) return;
      var y=String(row[4]||'').trim(); if(y && Number(y)!==yr) return;
      if (!out[country][wk]) out[country][wk]={};
      var o=out[country][wk];
      o.views         =(o.views         ||0)+toNum(row[6]);
      o.reach         =(o.reach         ||0)+toNum(row[7]);
      o.engagement    =(o.engagement    ||0)+toNum(row[8]);
      o.organicReach  =(o.organicReach  ||0)+toNum(row[12]);
      o.organicViews  =(o.organicViews  ||0)+toNum(row[14]);
      o.newFollowers  =(o.newFollowers  ||0)+toNum(row[11]);
      var fol=toNum(row[10]); if(fol) o.followers=fol;
    });
  });
  return out;
}

// ============================================================
// 월간 목표치 (RAW_그로스_month 탭)
// ============================================================
// 실제 시트 구조: US·KR 두 블록이 가로로 나란히 배치.
//   각 블록 = [지표 라벨 열][1월][2월]...[12월][연간합계]
//   월 헤더는 "1월"~"12월" (연도 없음 → 현재 연도 사용)
//   블록 국가는 헤더 위 섹션행의 "..._US" / "..._KR" 텍스트로 판별
function buildMonthlyTargets() {
  var out = { KR: {}, US: {} };
  var ss = getS();
  var sh = ss.getSheetByName('RAW_그로스_month');
  if (!sh || sh.getLastRow() < 3) return out;
  var lr = sh.getLastRow(), lc = sh.getLastColumn();
  var vals = sh.getRange(1, 1, Math.min(lr, 40), Math.min(lc, 40)).getValues();
  var year = new Date().getFullYear(); // 월 헤더에 연도가 없으므로 (weekToMonth과 동일 기준)

  var MONTH_RE = /^\s*(0?[1-9]|1[0-2])\s*월\s*$/; // "1월".."12월"

  // 1) 헤더 행 탐색: "N월" 셀이 3개 이상 있는 행
  var headerRow = -1;
  for (var r = 0; r < Math.min(vals.length, 6); r++) {
    var cnt = 0;
    for (var c = 0; c < vals[r].length; c++) if (MONTH_RE.test(String(vals[r][c] || ''))) cnt++;
    if (cnt >= 3) { headerRow = r; break; }
  }
  if (headerRow < 0) return out;

  // 2) 헤더행에서 연속된 월 구간을 블록으로 분리
  var hdr = vals[headerRow], blocks = [], cur = null;
  for (var c2 = 0; c2 < hdr.length; c2++) {
    var m = String(hdr[c2] || '').match(MONTH_RE);
    if (m) {
      var mo = year + '-' + (m[1].length === 1 ? '0' + m[1] : m[1]);
      if (!cur) { cur = { monthCols: {}, firstCol: c2 }; blocks.push(cur); }
      cur.monthCols[c2] = mo;
    } else { cur = null; }
  }
  blocks.forEach(function(b) { b.labelCol = b.firstCol - 1; }); // "지표" 열 = 첫 월 열 - 1

  // 3) 블록 국가 판별: 헤더행 이하 섹션행에서 라벨열 근처 "_US"/"_KR" 탐지
  function detectCountry(b) {
    for (var r = 0; r <= headerRow; r++) {
      for (var c = Math.max(0, b.labelCol - 1); c <= b.firstCol; c++) {
        var s = String(vals[r][c] || '').toUpperCase();
        if (s.indexOf('_US') >= 0 || /\bUS\b/.test(s)) return 'US';
        if (s.indexOf('_KR') >= 0 || /\bKR\b/.test(s)) return 'KR';
      }
    }
    return null;
  }

  // 4) 목표 라벨 → 필드 (달성/실적 행은 제외되도록 '목표'류만 매칭)
  var LABEL_F = [
    { re: /신규\s*목표\s*매출|목표\s*매출|매출\s*목표/, f: 'salesTarget' },
    { re: /목표\s*유입|유입\s*목표/,                    f: 'inflowTarget' },
    { re: /목표\s*콘텐츠\s*뷰|콘텐츠\s*뷰\s*목표|조회수\s*목표|목표\s*조회수/, f: 'viewsTarget' },
    { re: /ㄴ\s*콘텐츠\s*\(\s*85|오가닉.*목표|목표.*오가닉/, f: 'organicViewsTarget' }
  ];
  function fieldOf(label) {
    for (var i = 0; i < LABEL_F.length; i++) if (LABEL_F[i].re.test(label)) return LABEL_F[i].f;
    return null;
  }

  // 5) 각 블록 순회, 목표 행만 월별로 채움 (첫 매칭 우선)
  blocks.forEach(function(b) {
    var country = detectCountry(b);
    if (country !== 'KR' && country !== 'US') return;
    for (var r = headerRow + 1; r < vals.length; r++) {
      var label = String(vals[r][b.labelCol] || '').trim();
      if (!label) continue;
      var f = fieldOf(label);
      if (!f) continue;
      Object.keys(b.monthCols).forEach(function(cs) {
        var c = parseInt(cs), mo = b.monthCols[c];
        if (!out[country][mo]) out[country][mo] = {};
        if (out[country][mo][f] == null) out[country][mo][f] = toNum(vals[r][c]);
      });
    }
  });
  return out;
}

// 전체 탭 이름↔gid + 코드가 읽는 GROWTH 탭 정체 확인
function debugSheets_() {
  var ss = getS();
  var sheets = ss.getSheets().map(function(s){ return { name: s.getName(), gid: s.getSheetId() }; });
  function gridOf(sh, rows, cols) {
    if (!sh) return null;
    return sh.getRange(1,1,Math.min(sh.getLastRow(),rows||20),Math.min(sh.getLastColumn(),cols||25))
             .getValues().map(function(r){ return r.map(function(c){ return String(c||''); }); });
  }
  return {
    allSheets: sheets,
    GROWTH_KR_GID: GROWTH_KR_GID, GROWTH_US_GID: GROWTH_US_GID,
    growthKR_name: (gidSheet(GROWTH_KR_GID)||{getName:function(){return null;}}).getName(),
    growthUS_name: (gidSheet(GROWTH_US_GID)||{getName:function(){return null;}}).getName(),
    growthKR_grid: gridOf(gidSheet(GROWTH_KR_GID)),
    growthUS_grid: gridOf(gidSheet(GROWTH_US_GID))
  };
}
// RAW_그로스_week 원본 구조 덤프
function debugWeekSheet_() {
  var sh = getS().getSheetByName('RAW_그로스_week');
  if (!sh) return { error: 'RAW_그로스_week 시트 없음', gid: null };
  return {
    gid: sh.getSheetId(),
    grid: sh.getRange(1,1,Math.min(sh.getLastRow(),30),Math.min(sh.getLastColumn(),40))
            .getValues().map(function(r){ return r.map(function(c){ return String(c||''); }); })
  };
}

// RAW_그로스_month 구조 디버그
function debugMonthlySheet_() {
  var sh = getS().getSheetByName('RAW_그로스_month');
  if (!sh) return { error: 'RAW_그로스_month 시트 없음' };
  var vals = sh.getRange(1, 1, Math.min(sh.getLastRow(), 15), Math.min(sh.getLastColumn(), 20)).getValues();
  return vals.map(function(row) { return row.map(function(c) { return String(c || ''); }); });
}

// ============================================================
// KR 판매맵 (자사몰 + 올리브영) — pivot 형식
// ============================================================
function readKRChannel(sheet) {
  var byCode={}, byCat={};
  if (!sheet) return {byCode:byCode,byCat:byCat};
  var lastRow=sheet.getLastRow(), lastCol=sheet.getLastColumn();
  if (lastRow<2||lastCol<3) return {byCode:byCode,byCat:byCat};
  var allVals=sheet.getRange(1,1,lastRow,lastCol).getValues();
  var tz=Session.getScriptTimeZone();
  var codeColIdx=-1, catColIdx=-1, codeRowIdx=-1;
  // 헤더 스캔: "코드" 열 찾기
  for (var r=0;r<Math.min(10,allVals.length);r++) {
    for (var c=0;c<allVals[r].length;c++) {
      var hc=String(allVals[r][c]||'').replace(/\s/g,'');
      if ((hc.includes('코드')||hc.toLowerCase().includes('code')) && codeColIdx<0) { codeColIdx=c; codeRowIdx=r; }
      if ((hc.includes('카테고리')||hc.includes('제품군')) && catColIdx<0) catColIdx=c;
    }
    if (codeColIdx>=0) break;
  }
  if (codeColIdx<0) { codeColIdx=0; codeRowIdx=0; }
  var headerFull=allVals[codeRowIdx]||[];
  if (catColIdx<0) { for(var c=0;c<headerFull.length;c++){var hs=String(headerFull[c]||'').replace(/\s/g,'');if(hs.includes('카테고리')||hs.includes('제품군')){catColIdx=c;break;}}}

  function cellToDate(cell) {
    if (cell instanceof Date && !isNaN(cell.getTime())) return Utilities.formatDate(cell, tz, 'yyyy-MM-dd');
    var s=String(cell||'').trim(), now=new Date(), ny=now.getFullYear();
    var md=s.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (md) { var m=parseInt(md[1]),d=parseInt(md[2]); var yr=(m>now.getMonth()+2)?ny-1:ny; return yr+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'); }
    var ymd=s.match(/^(\d{4})[.\-\/]\s*(\d{1,2})[.\-\/]\s*(\d{1,2})/);
    if (ymd) return ymd[1]+'-'+String(parseInt(ymd[2])).padStart(2,'0')+'-'+String(parseInt(ymd[3])).padStart(2,'0');
    return null;
  }

  var dateRow=null, dateRowGasIdx=-1;
  for (var ri=codeRowIdx;ri<=codeRowIdx+4;ri++) {
    var rd=allVals[ri]||[], hit=0;
    for (var ci=codeColIdx+3;ci<rd.length;ci++) { if(cellToDate(rd[ci])) hit++; }
    if (hit>=5) { dateRow=rd; dateRowGasIdx=ri; break; }
  }
  if (!dateRow) return {byCode:byCode,byCat:byCat};
  var colDateMap={};
  for (var c=codeColIdx+1;c<dateRow.length;c++) { var ds=cellToDate(dateRow[c]); if(ds) colDateMap[c]=ds; }
  if (Object.keys(colDateMap).length===0) return {byCode:byCode,byCat:byCat};
  var dataStart=dateRowGasIdx+1, numRows=lastRow-dataStart; if(numRows<=0) return {byCode:byCode,byCat:byCat};
  var dv=allVals.slice(dataStart);
  dv.forEach(function(row) {
    var code=String(row[codeColIdx]||'').trim();
    var catKey=catColIdx>=0?(CAT_MAP[String(row[catColIdx]||'').trim()]||''):'';
    Object.keys(colDateMap).forEach(function(cs) {
      var qty=Number(String(row[parseInt(cs)]||'').replace(/,/g,''))||0; if(qty<=0) return;
      var ds=colDateMap[cs];
      if (code) { if(!byCode[code])byCode[code]={}; byCode[code][ds]=(byCode[code][ds]||0)+qty; }
      if (catKey) { if(!byCat[catKey])byCat[catKey]={}; byCat[catKey][ds]=(byCat[catKey][ds]||0)+qty; }
    });
  });
  return {byCode:byCode,byCat:byCat};
}

// ============================================================
// 통합 판매맵 (통합_일별 리스트 시트, KR+US 공용)
// 컬럼: 날짜(A0), 국가(B1), 채널(C2), 제품코드(D3), 제품명(E4),
//        구분1(F5), 구분2(G6), 카테고리(H7), 판매수량(I8), 매출(J9)
// KR+US 동시 구축 (시트 1회 읽기, refreshSales용)
function buildUnifiedSalesMapBoth() {
  try {
    var ss = SpreadsheetApp.openById(UNIFIED_SALES_SS_ID);
    var sh = ss.getSheetByName(UNIFIED_DAILY_TAB);
    if (!sh) return { kr:{byCode:{},byCat:{}}, us:{byCode:{},byCat:{}} };
    var totalRow = sh.getLastRow();
    if (totalRow < 2) return { kr:{byCode:{},byCat:{}}, us:{byCode:{},byCat:{}} };
    var startRow = Math.max(2, totalRow - 80000);
    var data = sh.getRange(startRow, 1, totalRow - startRow + 1, 9).getValues();
    var tz = Session.getScriptTimeZone();
    var thisYear = String(new Date().getFullYear());
    var maps = { '한국': {byCode:{},byCat:{}}, '미국': {byCode:{},byCat:{}} };
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var nation = String(row[1]||'').trim();
      if (!maps[nation]) continue;
      var code = String(row[3]||'').trim();
      var qty  = Number(row[8]) || 0;
      if (!code || qty <= 0) continue;
      var dateVal = row[0];
      var ds = (dateVal instanceof Date) ? Utilities.formatDate(dateVal, tz, 'yyyy-MM-dd') : String(dateVal||'').trim().slice(0,10);
      if (!ds || ds.length < 10 || ds.slice(0,4) !== thisYear) continue;
      var m = maps[nation];
      if (!m.byCode[code]) m.byCode[code] = {};
      m.byCode[code][ds] = (m.byCode[code][ds] || 0) + qty;
      var catKey = CAT_MAP[String(row[6]||'').trim()] || '';
      if (catKey) {
        if (!m.byCat[catKey]) m.byCat[catKey] = {};
        m.byCat[catKey][ds] = (m.byCat[catKey][ds] || 0) + qty;
      }
    }
    return { kr: maps['한국'], us: maps['미국'] };
  } catch(e) { Logger.log('buildUnifiedSalesMapBoth error: '+e); return { kr:{byCode:{},byCat:{}}, us:{byCode:{},byCat:{}} }; }
}

// ============================================================
function buildUnifiedSalesMap(country) {
  try {
    var ctryVal = country === 'KR' ? '한국' : '미국';
    var ss = SpreadsheetApp.openById(UNIFIED_SALES_SS_ID);
    var sh = ss.getSheetByName(UNIFIED_DAILY_TAB);
    if (!sh) { Logger.log('통합_일별 시트 없음'); return {byCode:{},byCat:{}}; }
    var totalRow = sh.getLastRow();
    if (totalRow < 2) return {byCode:{},byCat:{}};
    // 올해 데이터만 읽기 위해 마지막 80,000행만 읽음 (타임아웃 방지)
    var startRow = Math.max(2, totalRow - 80000);
    var readRows = totalRow - startRow + 1;
    var data = sh.getRange(startRow, 1, readRows, 9).getValues();
    var byCode={}, byCat={}, tz=Session.getScriptTimeZone();
    var thisYear = String(new Date().getFullYear());
    for (var i=0; i<data.length; i++) {
      var row = data[i];
      if (String(row[1]||'').trim() !== ctryVal) continue;
      var code = String(row[3]||'').trim();
      var qty  = Number(row[8]) || 0;
      if (!code || qty <= 0) continue;
      var dateVal = row[0];
      var ds = (dateVal instanceof Date) ? Utilities.formatDate(dateVal, tz, 'yyyy-MM-dd') : String(dateVal||'').trim().slice(0,10);
      if (!ds || ds.length < 10 || ds.slice(0,4) !== thisYear) continue;
      if (!byCode[code]) byCode[code] = {};
      byCode[code][ds] = (byCode[code][ds] || 0) + qty;
      var cat2 = String(row[6]||'').trim();
      var catKey = CAT_MAP[cat2] || '';
      if (catKey) {
        if (!byCat[catKey]) byCat[catKey] = {};
        byCat[catKey][ds] = (byCat[catKey][ds] || 0) + qty;
      }
    }
    Logger.log('buildUnifiedSalesMap('+country+'): codes='+Object.keys(byCode).length+' cats='+Object.keys(byCat).length);
    return {byCode:byCode, byCat:byCat};
  } catch(e) { Logger.log('buildUnifiedSalesMap error: '+e); return {byCode:{},byCat:{}}; }
}

function buildKRSalesMap() {
  try {
    var ss=SpreadsheetApp.openById(KR_SALES_SS_ID), byCode={}, byCat={};
    KR_SALES_TABS.forEach(function(tab) {
      var part=readKRChannel(ss.getSheetByName(tab));
      Object.keys(part.byCode).forEach(function(code){ if(!byCode[code])byCode[code]={}; Object.keys(part.byCode[code]).forEach(function(ds){byCode[code][ds]=(byCode[code][ds]||0)+part.byCode[code][ds];}); });
      Object.keys(part.byCat).forEach(function(cat){ if(!byCat[cat])byCat[cat]={}; Object.keys(part.byCat[cat]).forEach(function(ds){byCat[cat][ds]=(byCat[cat][ds]||0)+part.byCat[cat][ds];}); });
    });
    return {byCode:byCode,byCat:byCat};
  } catch(e){ Logger.log('buildKRSalesMap error: '+e); return {byCode:{},byCat:{}}; }
}

// ============================================================
// US 판매맵 (RAW list 형식)
// ============================================================
function parseAnyDate(v) { if(v instanceof Date&&!isNaN(v.getTime()))return v; var s=String(v||'').trim(); var m=s.match(/^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/); if(m)return new Date(parseInt(m[1]),parseInt(m[2])-1,parseInt(m[3])); var d=new Date(s); return isNaN(d.getTime())?null:d; }

function buildUSSalesMap() {
  try {
    var ss=SpreadsheetApp.openById(US_SALES_SS_ID), sheet=ss.getSheetByName(US_SALES_TAB);
    if (!sheet) return {byCode:{},byCat:{}};
    var lastRow=Math.min(sheet.getLastRow(),30000), lastCol=Math.min(sheet.getLastColumn(),15);
    if (lastRow<2) return {byCode:{},byCat:{}};
    var headers=sheet.getRange(1,1,1,lastCol).getValues()[0], dateIdx=-1,codeIdx=-1,qtyIdx=-1,catIdx=-1;
    headers.forEach(function(h,i) {
      var hs=String(h||'').toLowerCase().replace(/[\s\(\)（）]/g,'');
      if ((hs.includes('date')||hs.includes('일자'))&&dateIdx<0) dateIdx=i;
      else if ((hs.includes('productcode')||hs.includes('제품코드')||hs.includes('상품코드'))&&codeIdx<0) codeIdx=i;
      else if ((hs.includes('category')||hs.includes('제품군')||hs.includes('카테고리'))&&catIdx<0) catIdx=i;
      else if ((hs.includes('salesquantity')||hs.includes('판매수량')||(hs.includes('quantity')&&!hs.includes('week')))&&qtyIdx<0) qtyIdx=i;
    });
    if (dateIdx<0||codeIdx<0||qtyIdx<0) return {byCode:{},byCat:{}};
    var data=sheet.getRange(2,1,lastRow-1,lastCol).getValues(), byCode={},byCat={}, tz=Session.getScriptTimeZone();
    data.forEach(function(row) {
      var code=String(row[codeIdx]||'').trim(), qty=Number(String(row[qtyIdx]||'').replace(/,/g,''))||0;
      var dateObj=parseAnyDate(row[dateIdx]); if(!dateObj||qty<=0) return;
      var ds=Utilities.formatDate(dateObj,tz,'yyyy-MM-dd');
      var catKey=catIdx>=0?(CAT_MAP[String(row[catIdx]||'').trim()]||''):'';
      if (code) { if(!byCode[code])byCode[code]={}; byCode[code][ds]=(byCode[code][ds]||0)+qty; }
      if (catKey) { if(!byCat[catKey])byCat[catKey]={}; byCat[catKey][ds]=(byCat[catKey][ds]||0)+qty; }
    });
    return {byCode:byCode,byCat:byCat};
  } catch(e){ Logger.log('buildUSSalesMap error: '+e); return {byCode:{},byCat:{}}; }
}

// ============================================================
// doPost / 분석(리뷰) 저장
// ============================================================
function doPost(e) {
  try {
    var p=JSON.parse(e.postData.contents);
    if (p.type==='analysis') saveAnalysis(p);
    if (p.type==='saveAiSummary' && p.country && p.week && p.summary !== undefined) {
      saveAiSummaryToSheet(p.country, p.week, p.summary);
    }
    return json({ok:true});
  } catch(err){ return json({ok:false,error:err.toString()}); }
}

var ANALYSIS_HEADERS = ['link','hypothesis','analysis','salesConversion','salesReview','isLoop','loopLink','loopTitle','formatRepeat','productCode','productName','updatedAt'];
function saveAnalysis(payload) {
  var sheet=getS().getSheetByName('content_analysis')||getS().insertSheet('content_analysis');
  var data=sheet.getDataRange().getValues(), headers=data.length>0?data[0]:[];
  if (headers.length===0||headers[0]!=='link') { sheet.clearContents(); sheet.appendRow(ANALYSIS_HEADERS); headers=ANALYSIS_HEADERS.slice(); data=[headers]; }
  ANALYSIS_HEADERS.forEach(function(col){ if(headers.indexOf(col)<0){ sheet.getRange(1,headers.length+1).setValue(col); headers.push(col); } });
  var li=headers.indexOf('link'), fi=headers.indexOf(payload.field); if(fi<0) return;
  for (var r=1;r<data.length;r++) { if(String(data[r][li]||'')===payload.ref){ sheet.getRange(r+1,fi+1).setValue(payload.value); sheet.getRange(r+1,headers.indexOf('updatedAt')+1).setValue(new Date()); return; } }
  var nr=ANALYSIS_HEADERS.map(function(){return '';}); nr[li]=payload.ref; nr[fi]=payload.value; nr[headers.indexOf('updatedAt')]=new Date(); sheet.appendRow(nr);
}

function getAnalysisMap() {
  var sheet=getS().getSheetByName('content_analysis'); if(!sheet) return {};
  var data=sheet.getDataRange().getValues(); if(data.length<2) return {};
  var h=data[0], li=h.indexOf('link'),hi=h.indexOf('hypothesis'),ai=h.indexOf('analysis'),si=h.indexOf('salesConversion'),sri=h.indexOf('salesReview'),ili=h.indexOf('isLoop'),lli=h.indexOf('loopLink'),fri=h.indexOf('formatRepeat'),pci=h.indexOf('productCode'),pni=h.indexOf('productName');
  var res={};
  for (var r=1;r<data.length;r++) {
    var link=String(data[r][li]||'').trim(); if(!link) continue;
    var rawLoop=ili>=0?data[r][ili]:''; var isLoop=(rawLoop===true||String(rawLoop).toLowerCase()==='true');
    res[link]={ hypothesis:hi>=0?String(data[r][hi]||''):'', analysis:ai>=0?String(data[r][ai]||''):'',
      salesReview:sri>=0?String(data[r][sri]||''):'', salesConversion:si>=0?Number(data[r][si])||0:0,
      isLoop:isLoop, loopLink:lli>=0?String(data[r][lli]||''):'', loopTitle:(h.indexOf('loopTitle')>=0?String(data[r][h.indexOf('loopTitle')]||''):''), formatRepeat:fri>=0?String(data[r][fri]||''):'',
      productCode:pci>=0?String(data[r][pci]||'').trim():'', productName:pni>=0?String(data[r][pni]||'').trim():'' };
  }
  return res;
}

// ============================================================
// AI 요약 (Claude API) — 시트 저장/로드 포함
// ============================================================
var AI_SUMMARY_SHEET = 'ai_summary';
var AI_SUMMARY_HEADERS = ['week','country','summary','generatedAt'];

function getAiSummarySheet_() {
  var ss = getS();
  var sh = ss.getSheetByName(AI_SUMMARY_SHEET);
  if (!sh) {
    sh = ss.insertSheet(AI_SUMMARY_SHEET);
    sh.appendRow(AI_SUMMARY_HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function loadSavedAiSummary(country, week) {
  try {
    var sh = getAiSummarySheet_();
    var data = sh.getDataRange().getValues();
    if (data.length < 2) return null;
    var h = data[0], wi = h.indexOf('week'), ci = h.indexOf('country'), si = h.indexOf('summary');
    for (var r = 1; r < data.length; r++) {
      if (String(data[r][wi]) === String(week) && String(data[r][ci]) === String(country)) {
        var s = String(data[r][si] || '');
        return s || null;
      }
    }
    return null;
  } catch(e) { Logger.log('loadSavedAiSummary error: ' + e); return null; }
}

function saveAiSummaryToSheet(country, week, summary) {
  try {
    var sh = getAiSummarySheet_();
    var data = sh.getDataRange().getValues();
    var h = data[0], wi = h.indexOf('week'), ci = h.indexOf('country'), si = h.indexOf('summary'), gi = h.indexOf('generatedAt');
    var now = new Date();
    for (var r = 1; r < data.length; r++) {
      if (String(data[r][wi]) === String(week) && String(data[r][ci]) === String(country)) {
        if (si >= 0) sh.getRange(r+1, si+1).setValue(summary);
        if (gi >= 0) sh.getRange(r+1, gi+1).setValue(now);
        return;
      }
    }
    // 없으면 새 행 추가
    var nr = AI_SUMMARY_HEADERS.map(function(){ return ''; });
    nr[wi] = week; nr[ci] = country; nr[si] = summary; nr[gi] = now;
    sh.appendRow(nr);
  } catch(e) { Logger.log('saveAiSummaryToSheet error: ' + e); }
}

// ⚡ 이 함수를 에디터에서 한 번 실행 → 외부요청(UrlFetchApp) 권한 승인용
function authorizeExternalRequest() {
  var r = UrlFetchApp.fetch('https://api.anthropic.com/v1/models', {
    method: 'get',
    headers: { 'x-api-key': PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || 'none', 'anthropic-version': '2023-06-01' },
    muteHttpExceptions: true
  });
  Logger.log('외부요청 권한 OK. HTTP ' + r.getResponseCode());
  return r.getResponseCode();
}

function generateAiSummary(country, week, accountMetrics, weekItems, trend, meta) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY가 GAS Script Properties에 설정되지 않았습니다. GAS 에디터 > 프로젝트 설정 > 스크립트 속성에 추가해주세요.' };
  try {
    var m = accountMetrics || {};
    var reach = m.reach || 0, organicReach = m.organicReach || 0, views = m.views || 0, organicViews = m.organicViews || 0;
    var sales = m.sales || 0, inflow = m.inflow || 0;
    var salesRate  = m.salesAchieveRate  != null ? Math.round(m.salesAchieveRate * 100)  : null;
    var inflowRate = m.inflowAchieveRate != null ? Math.round(m.inflowAchieveRate * 100) : null;
    var organicRatio = reach > 0 ? Math.round((organicReach / reach) * 100) : 0;
    var itemCount = (weekItems || []).length;
    var isKR = country === 'KR';
    // 발행 콘텐츠 도달 분포 (타율/집중도 분석용, 최대 30개 = 사실상 전량)
    var itemLines = (weekItems || []).slice(0, 30).map(function(it) {
      return '- ' + (it.isReel ? '[릴스]' : '[피드]') + ' ' + String(it.title || '(제목없음)').slice(0,40) + ' | 도달 ' + (Number(it.reach)||0).toLocaleString() + ' | 참여 ' + (Number(it.engagement)||0).toLocaleString();
    }).join('\n');
    // 최근 주차별 추이 (성장/정체/하락 판단용)
    var trendLines = (trend || []).map(function(t) {
      return '- ' + t.week + ': 조회 ' + (t.views||0).toLocaleString() + ' / 매출 ₩' + (t.sales||0).toLocaleString() + ' / 유입 ' + (t.inflow||0).toLocaleString() + ' / 발행 ' + (t.itemCount||0) + '건';
    }).join('\n');

    var prompt = [
      '당신은 오호라(네일 브랜드) 콘텐츠팀의 SNS 성과 분석가입니다.',
      country + ' 마켓 ' + week + ' 주차 성과를 **정량 데이터 기준으로만** 분석하세요.',
      '⚠️ 콘텐츠 실물(영상·이미지·훅·기획)은 볼 수 없습니다. "왜 먹혔나" 같은 크리에이티브 추측은 절대 하지 말고, 숫자로 판단 가능한 것만 말하세요.',
      '',
      '## 이번 주 지표 (' + week + ')',
      '- 조회수: ' + views.toLocaleString() + (isKR ? ' (오가닉 ' + organicViews.toLocaleString() + ')' : ''),
      '- 매출: ₩' + sales.toLocaleString() + (salesRate  != null ? ' (목표 달성 ' + salesRate  + '%)' : ''),
      '- 유입: '   + inflow.toLocaleString() + (inflowRate != null ? ' (목표 달성 ' + inflowRate + '%)' : ''),
      '- 발행 콘텐츠: ' + ((meta && meta.totalPublished) || itemCount) + '건 (이 중 성과 분석 대상 = 릴스+고성과피드 ' + itemCount + '건)',
      (isKR ? '- 총 도달 대비 오가닉 비율: ' + organicRatio + '% (총 ' + reach.toLocaleString() + ' / 오가닉 ' + organicReach.toLocaleString() + ')' : null),
      '',
      '## 최근 추이 (성장/정체/하락 판단용)',
      trendLines || '(데이터 없음)',
      '',
      '## 성과 분석 대상 콘텐츠 (릴스 + 확실한 고성과 피드만 · 도달순)',
      '※ 피드(캐러셀·이미지)는 브랜딩 목적이라 성과가 원래 낮고 담당도 별도예요. 저성과 피드 ' + ((meta && meta.excludedFeed) || 0) + '건은 성과 분석에서 이미 제외했어요.',
      itemLines || '(분석 대상 없음)',
      '',
      '아래 3개 섹션으로 **간결하게** 답변하세요. 장황한 서술·수식어 금지:',
      '📊 **성과 요약** — 전주 대비 변화 + 목표 달성 현황 + 최근 추이 방향(성장/정체/하락). 2문장 이내.',
      '🎯 **콘텐츠 타율** — 위 "성과 분석 대상 콘텐츠"(릴스+고성과피드) 기준으로 성과 분포 진단(집중형 vs 분산형)을 구체 수치(상위 N건이 도달 X%)로. 저성과 피드는 이미 제외됐으니 언급 불필요. 2문장 이내.',
      '🚀 **다음 주 액션** — 불릿 2~3개, 각 한 문장, 데이터 기반 실행안.',
      '',
      '규칙:',
      '- **말투: 콘텐츠팀 동료에게 브리핑하듯 친근한 실무체(~요체)로.** 딱딱한 "~다/~한다" 종결 대신 "~했어요/~아쉬워요/~해봐요"처럼 부드럽게. 단, 수치와 핵심 진단은 명확히 유지하고 과한 감탄사·이모지 남발은 금지.',
      '- 각 불릿은 "**라벨**: 설명" 형식(라벨 굵게). 숫자는 만/억 단위로.',
      '- **다음 주 액션은 콘텐츠팀이 직접 실행 가능한 것만 제안하세요.** 광고 예산·광고 세팅·광고 집행 조정은 콘텐츠팀 관할이 아니므로 액션으로 제시하지 마세요.',
      '- 피드(캐러셀·이미지)는 브랜딩용이고 담당이 별도예요. 위 목록의 고성과 피드 외에는 피드를 성과 진단·액션에서 다루지 마세요. 분석·액션은 릴스 중심으로.',
      (isKR ? '- (KR) 오가닉 비율은 현황 진단에서 언급은 하되, 이를 높이는 방법은 콘텐츠 측면(포맷·주제·시리즈화·발행 전략)으로 제안하세요. "광고 예산 조정"으로 풀지 마세요.' : '- US는 광고 비중이 낮아 총/오가닉 도달 비율은 의미 없으니 언급하지 마세요.'),
      '- 콘텐츠 크리에이티브·기획 의도 추측 금지. 오직 수치 해석만.'
    ].filter(function(x){ return x !== null; }).join('\n');

    var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      payload: JSON.stringify({ model: 'claude-opus-5', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
      muteHttpExceptions: true
    });
    var result = JSON.parse(response.getContentText());
    if (result.error) return { ok: false, error: result.error.message || JSON.stringify(result.error) };
    // opus-5는 thinking이 기본 ON이라 content[0]이 사고 블록일 수 있음 → text 블록만 골라 합침
    var summary = '';
    (result.content || []).forEach(function(b) { if (b && b.type === 'text' && b.text) summary += b.text; });
    if (!summary) return { ok: false, error: 'AI 응답에서 텍스트를 찾지 못함 (stop_reason: ' + (result.stop_reason||'?') + ')' };
    saveAiSummaryToSheet(country, week, summary);
    return { ok: true, summary: summary };
  } catch(e) { return { ok: false, error: e.toString() }; }
}

// AI 통합 브리핑: KR·US 종합 비교 → Claude → country='GLOBAL'로 저장
function generateGlobalAiSummary(week) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY가 GAS Script Properties에 설정되지 않았습니다.' };
  try {
    var am = buildAccountMetrics();
    var selN = weekNum(week);
    // 국가별 이번 주 스냅샷 + 전주대비 + 팔로우 증감율
    function snap(c) {
      var cur = (am[c] && am[c][week]) || {};
      var wks = Object.keys(am[c]||{}).filter(function(w){ return weekNum(w) <= selN; }).sort(function(a,b){ return weekNum(a)-weekNum(b); });
      var prevKey = wks.length >= 2 ? wks[wks.length-2] : null;
      var prev = prevKey ? am[c][prevKey] : {};
      var wow = function(k){ var p=Number(prev[k]||0); return p ? Math.round(((Number(cur[k]||0)-p)/p)*100) : null; };
      var folCur = Number(cur.followers||0), folPrev = Number(prev.followers||0);
      var folGrow = folPrev ? +(((folCur-folPrev)/folPrev)*100).toFixed(1) : null;
      return { cur: cur, wow: wow, folCur: folCur, folGrow: folGrow, newFol: Number(cur.newFollowers||0),
        salesRate: cur.salesAchieveRate != null ? Math.round(cur.salesAchieveRate*100) : null,
        inflowRate: cur.inflowAchieveRate != null ? Math.round(cur.inflowAchieveRate*100) : null,
        trend: wks.slice(-6).map(function(w){ var mm=am[c][w]||{}; return { week:w, views:mm.views||0, sales:mm.sales||0, inflow:mm.inflow||0, followers:mm.followers||0 }; }) };
    }
    var KR = snap('KR'), US = snap('US');
    function block(name, s, isKR) {
      var c = s.cur;
      var lines = [
        '### ' + name,
        '- 조회수: ' + (Number(c.views||0)).toLocaleString() + (s.wow('views')!=null?' (전주 '+(s.wow('views')>0?'+':'')+s.wow('views')+'%)':''),
        '- 도달: ' + (Number(c.reach||0)).toLocaleString() + (s.wow('reach')!=null?' (전주 '+(s.wow('reach')>0?'+':'')+s.wow('reach')+'%)':''),
        '- 매출: ₩' + (Number(c.sales||0)).toLocaleString() + (s.salesRate!=null?' (목표 '+s.salesRate+'%)':'') + (s.wow('sales')!=null?' / 전주 '+(s.wow('sales')>0?'+':'')+s.wow('sales')+'%':''),
        '- 유입: ' + (Number(c.inflow||0)).toLocaleString() + (s.inflowRate!=null?' (목표 '+s.inflowRate+'%)':'') + (s.wow('inflow')!=null?' / 전주 '+(s.wow('inflow')>0?'+':'')+s.wow('inflow')+'%':''),
        '- 팔로워(누적): ' + s.folCur.toLocaleString() + ' / 증감율 ' + (s.folGrow!=null?(s.folGrow>0?'+':'')+s.folGrow+'%':'—') + ' / 신규 +' + s.newFol.toLocaleString()
      ];
      if (isKR) { var orgR = Number(c.reach||0)>0 ? Math.round((Number(c.organicReach||0)/Number(c.reach||0))*100) : 0; lines.push('- 오가닉 도달 비율: ' + orgR + '%'); }
      lines.push('- 최근 추이: ' + s.trend.map(function(t){ return t.week+'(조회'+(t.views>=10000?Math.round(t.views/10000)+'만':t.views)+'/매출'+(t.sales>=100000000?Math.round(t.sales/100000000)+'억':t.sales>=10000?Math.round(t.sales/10000)+'만':t.sales)+'/팔'+t.followers.toLocaleString()+')'; }).join(', '));
      return lines.join('\n');
    }

    var prompt = [
      '당신은 오호라(네일 브랜드) 콘텐츠팀의 SNS 성과 분석가입니다.',
      week + ' 주차의 **한국(KR)·미국(US) 양국 성과를 종합 비교**해 통합 브리핑을 작성하세요.',
      '⚠️ 콘텐츠 실물은 볼 수 없습니다. 크리에이티브 추측 금지, 정량 데이터 해석만.',
      '',
      block('🇰🇷 한국 (KR)', KR, true),
      '',
      block('🇺🇸 미국 (US)', US, false),
      '',
      '아래 3개 섹션으로 **간결하게** 답변하세요. 장황한 서술 금지:',
      '🌏 **양국 성과 요약** — KR·US 각각 전주 대비 변화 + 목표 달성 + 추이 방향(성장/정체/하락)을 한 줄씩. 팔로우 증감율도 포함.',
      '🔍 **국가별 포인트** — 두 마켓을 비교해 눈에 띄는 차이·특이점(어느 쪽이 강세/약세인지)을 수치로. 2~3문장.',
      '🚀 **다음 주 통합 액션** — 불릿 2~3개, 콘텐츠팀이 양국에 적용 가능한 실행안.',
      '',
      '규칙:',
      '- **말투: 콘텐츠팀 동료에게 브리핑하듯 친근한 실무체(~요체).** 수치·핵심 진단은 명확히.',
      '- 각 불릿은 "**라벨**: 설명" 형식. 숫자는 만/억 단위로.',
      '- **다음 주 액션은 콘텐츠팀이 직접 실행 가능한 것만.** 광고 예산·세팅·집행은 콘텐츠팀 관할이 아니므로 제외.',
      '- (KR) 오가닉 비율은 현황 언급만, 개선은 콘텐츠 측면으로. (US) 광고 비중이 낮아 오가닉 비율은 무의미하니 언급하지 마세요.',
      '- 크리에이티브·기획 의도 추측 금지. 수치 해석만.'
    ].join('\n');

    var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      payload: JSON.stringify({ model: 'claude-opus-5', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
      muteHttpExceptions: true
    });
    var result = JSON.parse(response.getContentText());
    if (result.error) return { ok: false, error: result.error.message || JSON.stringify(result.error) };
    var summary = '';
    (result.content || []).forEach(function(b) { if (b && b.type === 'text' && b.text) summary += b.text; });
    if (!summary) return { ok: false, error: 'AI 응답에서 텍스트를 찾지 못함 (stop_reason: ' + (result.stop_reason||'?') + ')' };
    saveAiSummaryToSheet('GLOBAL', week, summary);
    return { ok: true, summary: summary };
  } catch(e) { return { ok: false, error: e.toString() }; }
}

// ============================================================
// 유틸
// ============================================================
function toNum(v) { var n=Number(String(v||'').replace(/[,\s]/g,'')); return isFinite(n)?n:0; }
function weekNum(wk) { return Number(String(wk||'').replace(/[^0-9]/g,''))||0; }
function getISOWeekKey(date) { var d=new Date(date); d.setHours(0,0,0,0); var j=new Date(d.getFullYear(),0,1); var ord=Math.round((d.getTime()-j.getTime())/86400000)+1; return 'W'+(Math.floor((ord-1+j.getDay())/7)+1); }
function getWeekDates(weekKey, tz) {
  var n=weekNum(weekKey); var year=new Date().getFullYear(); var j=new Date(year,0,1);
  // 해당 주의 일요일 찾기
  var startOfWeek=new Date(j.getTime()-j.getDay()*86400000+(n-1)*7*86400000);
  tz=tz||Session.getScriptTimeZone(); var dates=[];
  for(var i=0;i<7;i++){var d=new Date(startOfWeek.getTime()+i*86400000); dates.push(Utilities.formatDate(d,tz,'yyyy-MM-dd'));}
  return dates;
}
function weekToMonth(wk) { var n=weekNum(wk),year=new Date().getFullYear(),j=new Date(year,0,1); var ws=new Date(j.getTime()-j.getDay()*86400000+(n-1)*7*86400000); var rep=new Date(Math.max(ws.getTime(),j.getTime())+3*86400000); return rep.getFullYear()+'-'+String(rep.getMonth()+1).padStart(2,'0'); }
function addDaysToStr(dateStr,n){var y=parseInt(dateStr.slice(0,4)),m=parseInt(dateStr.slice(5,7)),d=parseInt(dateStr.slice(8,10));var ts=Date.UTC(y,m-1,d+n);var dt=new Date(ts);return dt.getUTCFullYear()+'-'+String(dt.getUTCMonth()+1).padStart(2,'0')+'-'+String(dt.getUTCDate()).padStart(2,'0');}
function sumWindow(dayMap,key,pubStr,off,len) { if(!key||!dayMap||!dayMap[key])return 0; if(!pubStr||pubStr.length<10)return 0; var t=0; for(var i=0;i<len;i++){t+=(dayMap[key][addDaysToStr(pubStr,off+i)]||0);} return t; }
function liftWindows(dayMap,key,pubStr) { var o={}; [['d1',1],['d3',3],['d7',7]].forEach(function(p){var N=p[1]; o[p[0]]={b:sumWindow(dayMap,key,pubStr,-N,N),a:sumWindow(dayMap,key,pubStr,0,N)};}); o.w2a=sumWindow(dayMap,key,pubStr,7,7); return o; }
