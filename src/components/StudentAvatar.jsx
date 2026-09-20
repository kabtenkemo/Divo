import { avatarColor, firstLetter } from '../utils/format';

export default function StudentAvatar({ student, size = 46, circle = false }) {
  const style = circle
    ? { width: size, height: size }
    : { width: size, height: size };

  if (student?.photoBase64) {
    return (
      <img
        src={student.photoBase64}
        alt={student.name}
        className={circle ? 'avatar' : 'lb-avatar'}
        style={style}
      />
    );
  }
  return (
    <div
      className={circle ? 'avatar-circle' : 'lb-avatar-circle'}
      style={{ ...style, background: avatarColor(student?.name) }}
    >
      {firstLetter(student?.name)}
    </div>
  );
}