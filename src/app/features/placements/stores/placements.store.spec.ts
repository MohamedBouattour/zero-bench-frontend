import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NavigationStore } from '../../../core/stores/navigation.store';
import { ConsultantsStore } from '../../consultants/stores/consultants.store';
import { PlacementOpportunity } from '../models/placement.model';
import { PlacementsApiService } from '../services/placements-api.service';
import { PlacementsStore } from './placements.store';

const opportunity = (overrides: Partial<PlacementOpportunity>): PlacementOpportunity => ({
  id: 'p1',
  stage: 'matched',
  consultantId: '1',
  consultantName: 'Alexandre Martin',
  consultantTitle: 'Angular Architect',
  consultantStatus: 'on_bench',
  tjm: 750,
  clientId: 'c1',
  clientName: 'BNP Paribas Group',
  roleTitle: 'Digital Portal Lead Architect',
  matchScore: 96,
  note: '',
  createdAt: '2026-09-14T09:00:00.000Z',
  updatedAt: '2026-09-14T09:00:00.000Z',
  history: [{ stage: 'matched', at: '2026-09-14T09:00:00.000Z' }],
  ...overrides,
});

describe('PlacementsStore', () => {
  let api: { getPlacements: ReturnType<typeof vi.fn>; updatePlacement: ReturnType<typeof vi.fn> };
  const consultants = { loadAll: vi.fn() };

  beforeEach(() => {
    consultants.loadAll.mockClear();
    api = {
      getPlacements: vi.fn(() =>
        of([
          opportunity({ id: 'p1', stage: 'matched' }),
          opportunity({ id: 'p2', stage: 'signed', tjm: 600, clientId: 'c2', clientName: 'Airbus' }),
          opportunity({ id: 'p3', stage: 'lost', matchScore: undefined }),
        ]),
      ),
      updatePlacement: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: PlacementsApiService, useValue: api },
        { provide: NavigationStore, useValue: { loadBadges: vi.fn() } },
        { provide: ConsultantsStore, useValue: consultants },
      ],
    });
  });

  it('groups opportunities by stage and computes pipeline stats', async () => {
    const store = TestBed.inject(PlacementsStore);
    await store.loadOpportunities();
    expect(store.byStage().matched.map((o) => o.id)).toEqual(['p1']);
    expect(store.stats()).toEqual({
      activeCount: 1,
      signedCount: 1,
      lostCount: 1,
      winRate: 50,
      pipelineMonthlyValue: 750 * 20,
      averageMatchScore: 96,
    });
  });

  it('moves a card optimistically and refreshes consultants when signed', async () => {
    const store = TestBed.inject(PlacementsStore);
    await store.loadOpportunities();
    api.updatePlacement.mockReturnValue(of(opportunity({ id: 'p1', stage: 'signed' })));

    const pending = store.moveToStage('p1', 'signed');
    expect(store.entityMap()['p1'].stage).toBe('signed');
    await pending;

    expect(api.updatePlacement).toHaveBeenCalledWith('p1', { stage: 'signed' });
    expect(consultants.loadAll).toHaveBeenCalled();
  });

  it('rolls the card back when the move fails', async () => {
    const store = TestBed.inject(PlacementsStore);
    await store.loadOpportunities();
    api.updatePlacement.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { error: 'Invalid stage' } })),
    );

    await expect(store.moveToStage('p1', 'interviewing')).rejects.toThrow('Invalid stage');
    expect(store.entityMap()['p1'].stage).toBe('matched');
    expect(store.entityMap()['p1'].history).toHaveLength(1);
  });
});
