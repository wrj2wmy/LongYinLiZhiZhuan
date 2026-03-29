import { useState, useEffect, useCallback } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { Layout, Button, Space, App as AntApp, Typography, Tooltip, Flex } from 'antd';
import {
  FolderOpenOutlined,
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useTheme } from './theme/ThemeContext';
import { HeroListPanel } from './components/HeroListPanel';
import { HeroDetailPanel } from './components/HeroDetailPanel';
import * as api from './api/commands';
import type { HeroSummary, HeroDetail, EditStatus } from './types/hero';
import type { ForceEntry, KungfuEntry, TagEntry, SpeAddEntry } from './types/assets';
import './App.css';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;

function App() {
  const [heroes, setHeroes] = useState<HeroSummary[]>([]);
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);
  const [heroDetail, setHeroDetail] = useState<HeroDetail | null>(null);
  const [editStatus, setEditStatus] = useState<EditStatus>({ canUndo: false, canRedo: false, unsavedChanges: 0, undoDescription: null, redoDescription: null });
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toggleTheme, isDark } = useTheme();

  const { message } = AntApp.useApp();

  // Asset data
  const [forces, setForces] = useState<Record<number, ForceEntry>>({});
  const [skills, setSkills] = useState<Record<number, KungfuEntry>>({});
  const [tags, setTags] = useState<Record<number, TagEntry>>({});
  const [speAddNames, setSpeAddNames] = useState<Record<number, SpeAddEntry>>({});

  // Derived hero name map for relationship display
  const heroNames: Record<number, string> = {};
  heroes.forEach((h) => { heroNames[h.heroID] = h.heroName; });

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
      message.error(`加载失败: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [message]);

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
      message.success(`保存成功！备份: ${backup}`);
      const status = await api.getEditStatus();
      setEditStatus(status);
    } catch (err) {
      message.error(`保存失败: ${err}`);
    }
  }, [message]);

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

  // ── Landing page ──────────────────────────────────────────
  if (!loaded) {
    return (
      <div className="landing">
        <div className="landing-bg" />
        <div className="landing-content">
          <div className="landing-badge">存档编辑器</div>
          <Title level={1} className="landing-title">
            龙隐立志传
          </Title>
          <Text className="landing-subtitle">
            侠客数据 · 门派关系 · 武学天赋 · 一键编辑
          </Text>
          <Button
            type="primary"
            size="large"
            icon={<FolderOpenOutlined />}
            onClick={() => handleOpenSave()}
            loading={loading}
            className="landing-btn"
          >
            {loading ? '加载中...' : '打开存档文件夹'}
          </Button>
          <Text type="secondary" className="landing-hint">
            选择 saves/SaveSlot 目录
          </Text>
        </div>
        <Tooltip title={isDark ? '切换亮色' : '切换暗色'}>
          <Button
            className="landing-theme-toggle"
            shape="circle"
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
          />
        </Tooltip>
      </div>
    );
  }

  // ── Main editor ───────────────────────────────────────────
  return (
    <Layout className="app">
      <Header className="app-header">
        <Flex align="center" style={{ height: '100%', width: '100%' }}>
          <Text strong className="header-brand">
            龙隐立志传
          </Text>
          <div className="header-divider" />
          <Space size={4}>
            <Tooltip title="打开存档">
              <Button
                size="small"
                icon={<FolderOpenOutlined />}
                onClick={() => handleOpenSave()}
              />
            </Tooltip>
            <Tooltip title="保存 (Ctrl+S)">
              <Button
                size="small"
                type={editStatus.unsavedChanges > 0 ? 'primary' : 'default'}
                icon={<SaveOutlined />}
                onClick={handleSave}
                disabled={editStatus.unsavedChanges === 0}
              >
                {editStatus.unsavedChanges > 0 ? editStatus.unsavedChanges : null}
              </Button>
            </Tooltip>
            <Tooltip title={editStatus.undoDescription ? `撤销: ${editStatus.undoDescription}` : '撤销 (Ctrl+Z)'}>
              <Button
                size="small"
                icon={<UndoOutlined />}
                onClick={handleUndo}
                disabled={!editStatus.canUndo}
              />
            </Tooltip>
            <Tooltip title={editStatus.redoDescription ? `重做: ${editStatus.redoDescription}` : '重做 (Ctrl+Y)'}>
              <Button
                size="small"
                icon={<RedoOutlined />}
                onClick={handleRedo}
                disabled={!editStatus.canRedo}
              />
            </Tooltip>
          </Space>
          <div style={{ flex: 1 }} />
          <Tooltip title={isDark ? '切换亮色' : '切换暗色'}>
            <Button
              size="small"
              type="text"
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              style={{ color: isDark ? '#94A3B8' : undefined }}
            />
          </Tooltip>
        </Flex>
      </Header>
      <Layout hasSider>
        <Sider width={280} className="hero-sider">
          <HeroListPanel
            heroes={heroes}
            forces={forces}
            selectedHeroId={selectedHeroId}
            onSelectHero={selectHero}
          />
        </Sider>
        <Content className="main-content">
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
            <Flex align="center" justify="center" className="no-hero-selected">
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 16 }}>请从左侧列表选择一位侠客</Text>
              </div>
            </Flex>
          )}
        </Content>
      </Layout>
      <Footer className="app-footer">
        <Flex justify="space-between">
          <Text type="secondary" style={{ fontSize: 12 }}>
            {editStatus.unsavedChanges > 0
              ? `${editStatus.unsavedChanges} 处未保存的修改`
              : '就绪'}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Ctrl+Z 撤销 · Ctrl+Y 重做 · Ctrl+S 保存
          </Text>
        </Flex>
      </Footer>
    </Layout>
  );
}

function AppWithProvider() {
  return (
    <AntApp>
      <App />
    </AntApp>
  );
}

export default AppWithProvider;
