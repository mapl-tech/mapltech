import OfficeList from './OfficeList';
import OfficeMap from './OfficeMap';
import { ABOUT } from './content';
import ed from './Company.module.scss';
import styles from './Offices.module.scss';

/**
 * The three offices, compact: each office's live local time, whether it is
 * open, how its clock sits against Toronto's and a link to its own page.
 * Wide screens add the to-scale drawing of the three cities beside the list;
 * phones get the list alone.
 */
export default function Offices() {
  const { offices } = ABOUT;
  return (
    <section id="offices" className={ed.dark} aria-labelledby="offices-title">
      <div className={ed.inner}>
        <header className={ed.head}>
          <p className={ed.label}>{offices.label}</p>
          <h2 id="offices-title" className={ed.title}>
            {offices.title}
          </h2>
          <p className={ed.lede}>{offices.lede}</p>
        </header>

        <div className={styles.body}>
          <OfficeList label="Our offices" current="/about-us" placement="about_offices" />
          <div className={styles.map}>
            <OfficeMap />
          </div>
        </div>
      </div>
    </section>
  );
}
