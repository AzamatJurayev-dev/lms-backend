export class BulkPerformanceDto {
    lessonId: number;
    performances: {
        studentId: number;
        score?: number;
        grade?: string;
        comment?: string;
    }[];
}
