import { useEffect, useRef, useState } from 'react';
import type { UIMessage } from 'ai';

type UseAIChatScrollProps = {
  messages: UIMessage[];
};

export function useAIChatScroll({ messages }: UseAIChatScrollProps) {
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);

  const scrollToBottom = () => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop = scrollableContainerRef.current.scrollHeight;
      setShowScrollToBottomButton(false);
    }
  };

  useEffect(() => {
    const container = scrollableContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      setShowScrollToBottomButton(!isAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return {
    scrollToBottom,
    scrollableContainerRef,
    showScrollToBottomButton,
  };
}
