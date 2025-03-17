import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpriteSheetPlayerComponent } from './sprite-sheet-player.component';

describe('SpritesheetPlayerComponent', () => {
  let component: SpriteSheetPlayerComponent;
  let fixture: ComponentFixture<SpriteSheetPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpriteSheetPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpriteSheetPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
