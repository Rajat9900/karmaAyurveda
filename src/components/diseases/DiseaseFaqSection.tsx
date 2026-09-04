'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
	{
		question: 'Is Ayurvedic treatment safe for long-term kidney care?',
		answer:
			'Yes. Ayurvedic care focuses on natural healing, reducing inflammation, and improving kidney function through personalized herbs, diet, and lifestyle guidance under medical supervision.',
	},
	{
		question: 'How soon can I expect improvements in my condition?',
		answer:
			'Most patients begin noticing gradual improvement in symptoms, energy, and lab values within a few weeks to a few months, depending on the severity of the condition and consistency of treatment.',
	},
	{
		question: 'Can Ayurveda help reduce the need for dialysis?',
		answer:
			'In many cases, a holistic Ayurvedic approach helps slow disease progression and improve kidney function, which may support better kidney health and reduce dependence on dialysis over time.',
	},
	{
		question: 'Do I need to change my diet during treatment?',
		answer:
			'Diet is an essential part of the treatment. We provide personalized dietary guidance to support kidney healing, reduce toxin load, and improve overall metabolic health.',
	},
	{
		question: 'Are the medicines completely herbal?',
		answer:
			'Yes. Our treatment plans are based on natural herbal formulations and traditional therapies designed to support the body without harmful side effects when prescribed properly.',
	},
	{
		question: 'Can I speak with an expert before starting treatment?',
		answer:
			'Absolutely. We encourage an initial consultation so our specialists can understand your condition, review symptoms, and recommend a treatment plan suited to your needs.',
	},
];

export default function DiseaseFaqSection() {
	const [openLeftIndex, setOpenLeftIndex] = useState<number | null>(0);
	const [openRightIndex, setOpenRightIndex] = useState<number | null>(null);

	const leftFaqs = faqs.slice(0, 3);
	const rightFaqs = faqs.slice(3);

	const toggleFaq = (column: 'left' | 'right', index: number) => {
		if (column === 'left') {
			setOpenLeftIndex((prev) => (prev === index ? null : index));
			return;
		}

		setOpenRightIndex((prev) => (prev === index ? null : index));
	};

	const renderFaqList = (
		list: typeof faqs,
		column: 'left' | 'right',
		activeIndex: number | null
	) => (
		<div className="space-y-4">
			{list.map((faq, index) => {
				const isOpen = activeIndex === index;

				return (
					<div
						key={`${column}-${index}`}
						className={`overflow-hidden rounded-[22px] border bg-white shadow-[0_8px_28px_rgba(17,45,29,0.04)] transition-all duration-300 ${
							isOpen
								? 'border-[#1f4229] shadow-[0_14px_36px_rgba(17,45,29,0.08)]'
								: 'border-[#edf1ee] hover:border-[#cfe4d5]'
						}`}
					>
						<button
							onClick={() => toggleFaq(column, index)}
							className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:px-6"
						>
							<span className="pr-3 text-base font-bold leading-relaxed text-[#1a2e3b] md:text-lg">
								{faq.question}
							</span>

							<span
								className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
									isOpen
										? 'border-[#1f4229] bg-[#1f4229] text-white rotate-180'
										: 'border-[#dfece3] bg-[#f4faf5] text-[#1f4229]'
								}`}
							>
								<ChevronDown className="h-4 w-4" />
							</span>
						</button>

						<div
							className={`grid transition-all duration-300 ease-in-out ${
								isOpen
									? 'grid-rows-[1fr] opacity-100'
									: 'grid-rows-[0fr] opacity-0'
							}`}
						>
							<div className="overflow-hidden">
								<div className="border-t border-[#edf1ee] px-5 py-4 text-sm leading-7 text-[#4d5f57] md:px-6 md:text-base">
									{faq.answer}
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);

	return (
		<section className="py-16 md:py-20 bg-[#f5faf6]">
			<div className="container mx-auto px-4 max-w-7xl">
				<div className="mb-10 text-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-[#dfece3] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#1f4229] shadow-sm">
						<HelpCircle className="h-4 w-4" />
						FAQ
					</div>
					<h2 className="mt-5 text-3xl font-black tracking-tight text-[#112d1d] md:text-5xl">
						Frequently Asked Questions
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
					{renderFaqList(leftFaqs, 'left', openLeftIndex)}
					{renderFaqList(rightFaqs, 'right', openRightIndex)}
				</div>
			</div>
		</section>
	);
}
