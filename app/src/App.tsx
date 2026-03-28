import { useState, useEffect, useCallback } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { HeroListPanel } from './components/HeroListPanel';
import { HeroDetailPanel } from './components/HeroDetailPanel';
import * as api from './api/commands';
import type { HeroSummary, HeroDetail, EditStatus } from './types/hero';
import type { ForceEntry, KungfuEntry, TagEntry, SpeAddEntry } from './types/assets';
import './App.css';

function App() {
  const [heroes, setHeroes] = useState<HeroSummary[]>([]);
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);
  const [heroDetail, setHeroDetail] = useState<HeroDetail | null>(null);
  const [editStatus, setEditStatus] = useState<EditStatus>({ canUndo: false, canRedo: false, unsavedChanges: 0, undoDescription: null, redoDescription: null });
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Asset data
  const [forces, setForces] = useState<Record<number, ForceEntry>>({});
  const [skills, setSkills] = useState<Record<number, KungfuEntry>>({});
  const [tags, setTags] = useState<Record<number, TagEntry>>({});
  const [speAddNames, setSpeAddNames] = useState<Record<number, SpeAddEntry>>({});

  // Derived hero name map for relationship display
  const heroNames: Record<number, string> = {};
  heroes.forEach((h) => { heroNames[h.heroId] = h.heroName; });

  const loadSave = useCallback(async (slotPath: string) => {
    setLoading(true);
    try {
      const count = await api.loadSave(slotPath);
      console.log(`Loaded ${count} heroes`);

      const [heroList, forceData, skillData, tagData, speData] = await Promise.all([
        api.getHeroList(),
        api.getForceList(),
        api.getSkillList(),
        api.getTagList(),
        api.getSpeAddNames(),
      ]);

      setHeroes(heroList);
      setForces(forceData);
      setSkills(skillData);
      setTags(tagData);
      setSpeAddNames(speData);
      setLoaded(true);
      setSelectedHeroId(null);
      setHeroDetail(null);
    } catch (err) {
      console.error('Failed to load save:', err);
      alert(`加载失败: ${err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenSave = useCallback(async () => {
    const selected = await open({
      directory: true,
      title: '选择存档文件夹 (SaveSlot)',
    });
    if (!selected) return;
    await loadSave(selected);
  }, [loadSave]);

  const selectHero = useCallback(async (heroId: number) => {
    setSelectedHeroId(heroId);
    try {
      const detail = await api.getHero(heroId);
      setHeroDetail(detail);
    } catch (err) {
      console.error('Failed to load hero:', err);
    }
  }, []);

  const handleFieldChange = useCallback(async (fieldPath: string, value: unknown) => {
    if (selectedHeroId === null) return;
    try {
      await api.updateHeroField(selectedHeroId, fieldPath, value);
      const detail = await api.getHero(selectedHeroId);
      setHeroDetail(detail);
      const status = await api.getEditStatus();
      setEditStatus(status);
    } catch (err) {
      console.error('Failed to update field:', err);
    }
  }, [selectedHeroId]);

  const handleUndo = useCallback(async () => {
    await api.undoEdit();
    if (selectedHeroId !== null) {
      const detail = await api.getHero(selectedHeroId);
      setHeroDetail(detail);
    }
    const status = await api.getEditStatus();
    setEditStatus(status);
    const heroList = await api.getHeroList();
    setHeroes(heroList);
  }, [selectedHeroId]);

  const handleRedo = useCallback(async () => {
    await api.redoEdit();
    if (selectedHeroId !== null) {
      const detail = await api.getHero(selectedHeroId);
      setHeroDetail(detail);
    }
    const status = await api.getEditStatus();
    setEditStatus(status);
    const heroList = await api.getHeroList();
    setHeroes(heroList);
  }, [selectedHeroId]);

  const handleSave = useCallback(async () => {
    try {
      const backup = await api.saveFile();
      alert(`保存成功！备份: ${backup}`);
      const status = await api.getEditStatus();
      setEditStatus(status);
    } catch (err) {
      alert(`保存失败: ${err}`);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); handleRedo(); }
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo, handleSave]);

  if (!loaded) {
    return (
      <div className="app-loading">
        <h1>龙隐立志传 存档编辑器</h1>
        <button onClick={() => handleOpenSave()} disabled={loading}>
          {loading ? '加载中...' : '打开存档'}
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="toolbar">
        <button onClick={() => handleOpenSave()}>打开存档</button>
        <button onClick={handleSave} disabled={editStatus.unsavedChanges === 0}>
          保存 {editStatus.unsavedChanges > 0 ? `(${editStatus.unsavedChanges})` : ''}
        </button>
        <button onClick={handleUndo} disabled={!editStatus.canUndo} title={editStatus.undoDescription || ''}>
          撤销
        </button>
        <button onClick={handleRedo} disabled={!editStatus.canRedo} title={editStatus.redoDescription || ''}>
          重做
        </button>
        <span className="toolbar-title">龙隐立志传 存档编辑器</span>
      </div>
      <div className="main-content">
        <HeroListPanel
          heroes={heroes}
          forces={forces}
          selectedHeroId={selectedHeroId}
          onSelectHero={selectHero}
        />
        {heroDetail && selectedHeroId !== null ? (
          <HeroDetailPanel
            hero={heroDetail}
            heroId={selectedHeroId}
            forces={forces}
            skills={skills}
            tags={tags}
            speAddNames={speAddNames}
            heroNames={heroNames}
            onFieldChange={handleFieldChange}
          />
        ) : (
          <div className="no-hero-selected">
            <p>请从左侧列表选择一位侠客</p>
          </div>
        )}
      </div>
      <div className="status-bar">
        {editStatus.unsavedChanges > 0
          ? `${editStatus.unsavedChanges} 处未保存的修改 | Ctrl+Z 撤销 | Ctrl+S 保存`
          : '就绪'}
      </div>
    </div>
  );
}

export default App;
