import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GetQuizStatsDto } from './dto/get-quiz-stats.dto';
import { GetJobStatsDto } from './dto/get-job-stats.dto';
import { GetAppStatsDto } from './dto/get-app-stats.dto';
import { GetUserStatsDto } from './dto/get-user-stats.dto';
import { StatisticsResponseDto } from './dto/statistics-response.dto';

@Injectable()
export class StatisticsGatewayService {
  constructor(
    @Inject('NATS_SERVICE')
    private readonly client: ClientProxy,
  ) { }

  getStats(): Observable<StatisticsResponseDto> {
    return this.client.send('ats.statistics.get', {});
  }

  getQuizStats(query: GetQuizStatsDto): Observable<StatisticsResponseDto> {
    return this.client.send('ats.statistics.quiz', query);
  }

  getJobStats(query: GetJobStatsDto): Observable<StatisticsResponseDto> {
    return this.client.send('ats.statistics.jobs', query);
  }

  getAppStats(query: GetAppStatsDto): Observable<StatisticsResponseDto> {
    return this.client.send('ats.statistics.applications', query);
  }

  getUserStats(query: GetUserStatsDto): Observable<StatisticsResponseDto> {
    return this.client.send('ats.userStatistics.get', query);
  }
}
