'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiMinus } from 'react-icons/hi2';
import styles from './Accordion.module.scss';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.accordion}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className={`${styles.item} ${isOpen ? styles.open : ''}`}>
            <button
              className={styles.trigger}
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
            >
              <span className={styles.question}>{item.question}</span>
              <span className={styles.icon}>
                {isOpen ? <HiMinus size={18} /> : <HiPlus size={18} />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  className={styles.content}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <p className={styles.answer}>{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
