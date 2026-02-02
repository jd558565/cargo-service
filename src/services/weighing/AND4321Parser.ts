import { WeighingReading } from './types';

/**
 * A&D NEW-4321 PLUS 프로토콜 파서
 * 포맷: ST,GS,+000012.34Kg<CR><LF>
 * 포맷2: OL,GS,+999999.99Kg<CR><LF> (과적)
 */
export class AND4321Parser {
    // 소수점이 포함될 수 있으므로 정규식으로 숫자 파트 추출
    private static readonly DATA_REGEX = /^(ST|UN|OL),(GS|NT),([+-])?(\d+)(\.(\d+))?([a-zA-Z ]+)?$/;

    static parse(raw: string): Partial<WeighingReading> | null {
        // CR LF 제거 및 콤마 기준 분리 시도 전 공백 제거
        const cleanRaw = raw.replace(/[\r\n]/g, '').trim();
        if (!cleanRaw) return null;

        const parts = cleanRaw.split(',');
        if (parts.length < 3) return null;

        const header = parts[0]; // ST, UN, OL
        const type = parts[1];   // GS, NT
        const dataPart = parts[2]; // +000012.34Kg

        // 데이터 파트에서 숫자와 단위 분리
        // 보통 "Kg" 또는 "g" 등이 뒤에 붙음
        const match = dataPart.match(/([+-])?(\d+\.?\d*)([a-zA-Z]+)?/);
        if (!match) return null;

        const sign = match[1] === '-' ? -1 : 1;
        const weightValue = parseFloat(match[2]);
        const unit = (match[3] || 'kg').toLowerCase() as 'kg';

        // 상태값 매핑
        let status: WeighingReading['status'] = 'UNSTABLE';
        if (header === 'ST') status = 'STABLE';
        if (header === 'OL') status = 'OVERLOAD';
        if (header === 'UN') status = 'UNSTABLE';

        // 사용자 정책: 정수만 허용, 음수 0 처리
        const finalWeight = Math.floor(Math.max(0, weightValue * sign));

        const result: WeighingReading = {
            status,
            weight: finalWeight,
            unit,
            source: 'SERIAL',
            receivedAt: new Date(),
            raw: cleanRaw
        };

        console.log(`[PARSER RESULT] Status: ${status}, Weight: ${finalWeight}, Unit: ${unit}`); // 2단계: 파싱 결과 로그
        return result;
    }
}
