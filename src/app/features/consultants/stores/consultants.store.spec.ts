import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NavigationStore } from '../../../core/stores/navigation.store';
import { Consultant, ConsultantPayload } from '../models/consultant.model';
import { ConsultantsApiService } from '../services/consultants-api.service';
import { ConsultantsStore } from './consultants.store';

const consultant = (overrides: Partial<Consultant>): Consultant => ({
  id: '1',
  fullName: 'Alexandre Martin',
  title: 'Angular Architect',
  seniority: 'Lead',
  status: 'on_bench',
  primarySkill: 'Angular',
  skills: ['Angular', 'TypeScript'],
  tjm: 750,
  yearsOfExperience: 11,
  email: 'a@benchzero.io',
  phone: '',
  location: 'Paris',
  languages: [],
  certifications: [],
  bio: '',
  missionHistory: [],
  ...overrides,
});

const SEED = [
  consultant({ id: '1', fullName: 'Alexandre Martin', status: 'on_bench', daysOnBench: 22, tjm: 750 }),
  consultant({ id: '2', fullName: 'Camille Leroy', status: 'ending_soon', missionEndDate: '2026-09-30', tjm: 680, skills: ['Python', 'Spark'], primarySkill: 'Python' }),
  consultant({ id: '3', fullName: 'Julien Moreau', status: 'on_bench', daysOnBench: 31, tjm: 690, skills: ['Java', 'Kafka'], primarySkill: 'Java' }),
  consultant({ id: '4', fullName: 'Sarah Benali', status: 'on_mission', tjm: 540, skills: ['React'], primarySkill: 'React' }),
];

describe('ConsultantsStore', () => {
  let api: { getConsultants: ReturnType<typeof vi.fn>; createConsultant: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = {
      getConsultants: vi.fn(() => of(SEED)),
      createConsultant: vi.fn((payload: ConsultantPayload) => of({ ...payload, id: '99', missionHistory: [] })),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: ConsultantsApiService, useValue: api },
        { provide: NavigationStore, useValue: { loadBadges: vi.fn() } },
      ],
    });
  });

  it('loads consultants and derives status counts', async () => {
    const store = TestBed.inject(ConsultantsStore);
    await store.loadAll();
    expect(store.isLoading()).toBe(false);
    expect(store.totalCount()).toBe(4);
    expect(store.benchCount()).toBe(2);
    expect(store.endingSoonCount()).toBe(1);
  });

  it('sorts by availability by default: longest bench first, then missions ending soon', async () => {
    const store = TestBed.inject(ConsultantsStore);
    await store.loadAll();
    expect(store.filteredConsultants().map((c) => c.id)).toEqual(['3', '1', '2', '4']);
    expect(store.availableConsultants().map((c) => c.id)).toEqual(['3', '1', '2']);
  });

  it('filters by status and searches skills', async () => {
    const store = TestBed.inject(ConsultantsStore);
    await store.loadAll();
    store.setFilterStatus('on_bench');
    store.setSearchQuery('kafka');
    expect(store.filteredConsultants().map((c) => c.fullName)).toEqual(['Julien Moreau']);
  });

  it('toggles sort direction on the same column', async () => {
    const store = TestBed.inject(ConsultantsStore);
    await store.loadAll();
    store.toggleSort('tjm');
    expect(store.filteredConsultants()[0].tjm).toBe(540);
    store.toggleSort('tjm');
    expect(store.filteredConsultants()[0].tjm).toBe(750);
  });

  it('prepends created consultants and refreshes navigation badges', async () => {
    const store = TestBed.inject(ConsultantsStore);
    await store.loadAll();
    const { id, missionHistory, clientName, ...payload } = consultant({ fullName: 'Emma Petit' });
    const created = await store.create(payload);
    expect(created.id).toBe('99');
    expect(store.consultants()[0].fullName).toBe('Emma Petit');
    expect(store.isSaving()).toBe(false);
    expect(TestBed.inject(NavigationStore).loadBadges).toHaveBeenCalled();
  });
});
