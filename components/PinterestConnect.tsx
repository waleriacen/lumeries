'use client';

import { useState, useEffect } from 'react';

type Board = {
  id: string;
  name: string;
};

type PinterestConnectProps = {
  accessToken: string | null;
  username: string | null;
  posterImageUrl: string;
  t: {
    connectPinterest: string;
    pinterestConnected: string;
    pinToBoard: string;
    selectBoard: string;
    pinSuccess: string;
    pinError: string;
    loadingBoards: string;
    pinterestDescription: string;
  };
};

export default function PinterestConnect({
  accessToken,
  username,
  posterImageUrl,
  t,
}: PinterestConnectProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [pinStatus, setPinStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showBoardSelect, setShowBoardSelect] = useState(false);

  // Load boards when connected
  useEffect(() => {
    if (accessToken && showBoardSelect && boards.length === 0) {
      loadBoards();
    }
  }, [accessToken, showBoardSelect]);

  const loadBoards = async () => {
    if (!accessToken) return;

    setIsLoadingBoards(true);
    try {
      const response = await fetch('/api/pinterest/boards', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.boards) {
        setBoards(data.boards);
        if (data.boards.length > 0) {
          setSelectedBoard(data.boards[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load boards:', error);
    } finally {
      setIsLoadingBoards(false);
    }
  };

  const handleConnect = () => {
    // Redirect to Pinterest OAuth
    window.location.href = '/api/auth/pinterest';
  };

  const handleCreatePin = async () => {
    if (!accessToken || !selectedBoard) return;

    setIsPinning(true);
    setPinStatus('idle');

    try {
      const response = await fetch('/api/pinterest/create-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          boardId: selectedBoard,
          title: 'Mein Mondphasen-Poster',
          description: t.pinterestDescription,
          imageUrl: posterImageUrl,
          link: 'https://lumeries.com',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPinStatus('success');
        setTimeout(() => setPinStatus('idle'), 3000);
      } else {
        setPinStatus('error');
      }
    } catch (error) {
      console.error('Failed to create pin:', error);
      setPinStatus('error');
    } finally {
      setIsPinning(false);
    }
  };

  // Not connected - show connect button
  if (!accessToken) {
    return (
      <button
        onClick={handleConnect}
        className="flex items-center gap-2 px-4 py-2 bg-[#E60023] hover:bg-[#ad081b] text-white rounded-full transition text-sm font-medium"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
        </svg>
        {t.connectPinterest}
      </button>
    );
  }

  // Connected - show pin controls
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-green-600">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        {t.pinterestConnected} ({username})
      </div>

      {!showBoardSelect ? (
        <button
          onClick={() => setShowBoardSelect(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#E60023] hover:bg-[#ad081b] text-white rounded-full transition text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
          </svg>
          {t.pinToBoard}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          {isLoadingBoards ? (
            <p className="text-sm text-gray-500">{t.loadingBoards}</p>
          ) : (
            <>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">{t.selectBoard}</option>
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleCreatePin}
                disabled={!selectedBoard || isPinning}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#E60023] hover:bg-[#ad081b] disabled:bg-gray-300 text-white rounded-full transition text-sm font-medium"
              >
                {isPinning ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                  </svg>
                )}
                {t.pinToBoard}
              </button>
            </>
          )}

          {pinStatus === 'success' && (
            <p className="text-sm text-green-600">{t.pinSuccess}</p>
          )}
          {pinStatus === 'error' && (
            <p className="text-sm text-red-600">{t.pinError}</p>
          )}
        </div>
      )}
    </div>
  );
}
