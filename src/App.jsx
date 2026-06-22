import React, { useState, useEffect } from 'react';

// 데이터 안전 접근을 위한 유틸리티 함수
const safeNum = (val) => {
  if (val === undefined || val === null) return 0;
  const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
  return isNaN(num) ? 0 : num;
};

export default function OhoraDashboard() {
  // 상태 관리
  const [selectedWeek, setSelectedWeek] = useState('W26'); // 기본 최신 주차
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    newFollowers: 0,
    totalFollowers: 41250, // 기본값 샘플 데이터 예시 (스스크린샷 참고)
    weeklyTrends: {},
    monthlyTrends: []
  });

  // 주차 리스트 생성 (W1 ~ W26)
  const weeks = Array.from({ length: 26 }, (_, i) => `W${i + 1}`);

  // 구글 시트 데이터 불러오기 모킹/연동 함수
  const fetchGoogleSheetData = async () => {
    setIsLoading(true);
    try {
      // 실제 API 연동 시 이 부분에 fetch 구조가 들어갑니다.
      await new Promise((resolve) => setTimeout(resolve, 1200)); // 로딩 효과
      
      // 불러오기 성공 시 가상 데이터 매핑 (스크린샷 지표 기반 안전 구조)
      setDashboardData({
        newFollowers: 120, // 예시 데이터 입력
        totalFollowers: 41370,
        weeklyTrends: {
          'W26': { new: 120, total: 41370, status: '상승' }
        },
        monthlyTrends: [
          { month: '1월', value: 38000 },
          { month: '2월', value: 39200 },
          { month: '3월', value: 40100 },
          { month: '4월', value: 40800 },
          { month: '5월', value: 41250 },
          { month: '6월', value: 41370 },
        ]
      });
    } catch (error) {
      console.error("데이터 로드 중 에러 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#faf8f5', minHeight: '100vh', fontFamily: 'sans-serif', color: '#333' }}>
      
      {/* 상단 헤더 영역 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e5e5e5', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, color: '#111' }}>ohora-dashboard</h1>
          <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>모든 데이터는 팀 전체에 공유되며 누구나 입력·수정할 수 있습니다.</p>
        </div>
        
        {/* 구글 시트 연동 버튼 */}
        <button 
          onClick={fetchGoogleSheetData}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#ccc' : '#c85e6a',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '13px',
            transition: 'background-color 0.2s'
          }}
        >
          {isLoading ? '🔄 데이터 불러오는 중...' : '⚙️ 구글시트에서 불러오기'}
        </button>
      </div>

      {/* 주차 선택 버튼 바 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', color: '#444', marginBottom: '12px' }}>발행주차 선택</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {weeks.map((week) => {
            const isLatest = week === 'W26';
            const isSelected = selectedWeek === week;
            return (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: isSelected ? 'none' : '1px solid #e0dcd5',
                  backgroundColor: isSelected ? '#c85e6a' : '#fff',
                  color: isSelected ? '#fff' : '#444',
                  fontSize: '13px',
                  fontWeight: isSelected || isLatest ? 'bold' : 'normal',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {week}{isLatest && ' (최신)'}
              </button>
            );
          })}
        </div>
      </div>

      {/* 계정 성장 / 구매유도 지표 섹션 */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f3d30', borderLeft: '4px solid #1f3d30', paddingLeft: '8px', marginBottom: '16px' }}>
          계정 성장 / 구매유도
        </h2>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* 신규 팔로우 카드 */}
          <div style={{ flex: '1', minWidth: '240px', backgroundColor: '#fff', borderRadius: '12px', padding: '20px', borderTop: '4px solid #c85e6a', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px', marginBottom: '12px' }}>
              <span>🟢 신규 팔로우</span>
              <span style={{ fontSize: '18px' }}>👤⁺</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111', marginBottom: '8px' }}>
              {isLoading ? '...' : safeNum(dashboardData.weeklyTrends[selectedWeek]?.new || dashboardData.newFollowers).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>전주 대비 —</div>
          </div>

          {/* 누적 팔로우 카드 */}
          <div style={{ flex: '1', minWidth: '240px', backgroundColor: '#fff', borderRadius: '12px', padding: '20px', borderTop: '4px solid #c85e6a', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px', marginBottom: '12px' }}>
              <span>🟢 팔로워 (누적)</span>
              <span style={{ fontSize: '18px' }}>📋</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111', marginBottom: '8px' }}>
              {isLoading ? '...' : safeNum(dashboardData.weeklyTrends[selectedWeek]?.total || dashboardData.totalFollowers).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>전주 대비 —</div>
          </div>

        </div>
      </div>

      {/* 월간 추이 단순 차트 시각화 섹션 */}
      {dashboardData.monthlyTrends.length > 0 && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>📊 월간 팔로워 추이</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '20px', paddingTop: '20px' }}>
            {dashboardData.monthlyTrends.map((item, idx) => {
              const maxVal = Math.max(...dashboardData.monthlyTrends.map(t => t.value));
              const heightPercent = (item.value / maxVal) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <span style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>{item.value.toLocaleString()}</span>
                  <div style={{ width: '100%', height: `${heightPercent}%`, backgroundColor: '#e5cbd0', borderRadius: '4px 4px 0 0', minHeight: '10px' }}></div>
                  <span style={{ fontSize: '12px', color: '#333', marginTop: '8px' }}>{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}